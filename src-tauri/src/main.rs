// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use image::imageops::FilterType;
use image::io::Reader as ImageReader;
use image::{ImageBuffer, ImageFormat, Rgb};
use rayon::prelude::{IntoParallelIterator, ParallelIterator};
// use image_compare::Algorithm;
use std::fs::read;
use std::io::{BufReader, Cursor};
use std::thread;
use tauri::api::dir::{read_dir, DiskEntry};

const IMAGE_SIZE: u32 = 512;

struct ComparableImage {
    name: String,
    file: DiskEntry,
    image: ImageBuffer<Rgb<u8>, Vec<u8>>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn set_directory(window: tauri::Window, directory: String) -> Result<(), String> {
    let files = read_dir(directory, true).map_err(|_| "Invalid Dir")?;

    thread::spawn(move || {
        let supported = [(".png", ImageFormat::Png), (".jpg", ImageFormat::Jpeg)];

        let output: Vec<ComparableImage> = files
            .into_par_iter()
            .map(|file| {
                if let Some(file_name) = &file.name {
                    let format = supported
                        .iter()
                        .find(|(end_str, _)| file_name.to_lowercase().ends_with(end_str));
                    if let Some((_, image_format)) = format {
                        println!("Checking file: {:?}", &file.path.as_os_str());

                        let data = read(&file.path).expect("Failed to read image");
                        let image = ImageReader::with_format(
                            BufReader::new(Cursor::new(&data)),
                            *image_format,
                        )
                        .decode()
                        .expect("Failed to decode")
                        .resize_exact(IMAGE_SIZE, IMAGE_SIZE, FilterType::CatmullRom)
                        .into_rgb8();

                        Some(ComparableImage {
                            name: file_name.clone(),
                            file,
                            image,
                        })
                    } else {
                        None
                    }
                } else {
                    None
                }
            })
            .filter(|maybe_image| maybe_image.is_some())
            .map(|certain_image| certain_image.expect("Somehow didn't get an image"))
            .collect();

        let enumerated_output: Vec<_> = output
            .into_iter()
            .enumerate()
            .map(|(i, img)| (img, i))
            .collect();

        for (outer_image, outer_i) in &enumerated_output {
            for (inner_image, _) in &enumerated_output[outer_i + 1..] {
                let res = image_compare::rgb_hybrid_compare(&outer_image.image, &inner_image.image)
                    .expect("Failed to compare images");

                let score_string = format!(
                    "Score for {} and {} is {}",
                    outer_image.name, inner_image.name, res.score
                );

                window.emit("score", score_string).unwrap();
            }
        }
    });

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, set_directory])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
