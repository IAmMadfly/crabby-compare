// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use image::imageops::FilterType;
use image::io::Reader as ImageReader;
use image::{ImageBuffer, ImageFormat, Rgb};
use rayon::prelude::{IntoParallelIterator, ParallelIterator};
use serde::{Deserialize, Serialize};
// use serde::{self, Deserialize, Serialize};
// use image_compare::Algorithm;
use std::fs::read;
use std::io::{BufReader, Cursor};
use std::sync::mpsc;
use std::thread;
use tauri::api::dir::read_dir;

const IMAGE_SIZE: u32 = 512;

#[derive(Debug)]
struct ComparableImage {
    name: String,
    path: String,
    image: ImageBuffer<Rgb<u8>, Vec<u8>>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct Comparison {
    #[serde(rename = "baseImage")]
    base_image: ImageData,
    images: Vec<ImageDataScored>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct ImageData {
    name: String,
    path: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct ImageDataScored {
    #[serde(rename = "imageData")]
    image_data: ImageData,
    score: f64,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn set_directory(window: tauri::Window, directory: String) -> Result<(), String> {
    let files = read_dir(directory, true).map_err(|_| "Invalid Dir")?;

    let supported = [(".png", ImageFormat::Png), (".jpg", ImageFormat::Jpeg)];
    let (tx, rx) = mpsc::channel::<ComparableImage>();

    thread::spawn(move || {
        let mut vec: Vec<ComparableImage> = Vec::new();

        for comparison in rx.iter() {
            println!("Comparing image ({}): {}", vec.len(), &comparison.name);

            let mut image_comparison = Comparison {
                base_image: ImageData {
                    name: comparison.name.clone(),
                    path: comparison.path.clone(),
                },
                images: Vec::with_capacity(vec.len()),
            };

            for older_comparison in &vec {
                let res =
                    image_compare::rgb_hybrid_compare(&comparison.image, &older_comparison.image)
                        .expect("Failed to compare images");

                let score = ImageDataScored {
                    image_data: ImageData {
                        name: older_comparison.name.clone(),
                        path: older_comparison.path.clone(),
                    },
                    score: res.score,
                };

                image_comparison.images.push(score);
            }

            vec.insert(0, comparison);

            window.emit("score", image_comparison).unwrap();
        }
    });

    files.into_par_iter().for_each_with(tx, |s, file| {
        if let Some(file_name) = &file.name {
            let format = supported
                .iter()
                .find(|(end_str, _)| file_name.to_lowercase().ends_with(end_str));
            if let Some((_, image_format)) = format {
                println!("Checking file: {:?}", &file.path.as_os_str());

                let data = read(&file.path).expect("Failed to read image");
                let image =
                    ImageReader::with_format(BufReader::new(Cursor::new(&data)), *image_format)
                        .decode()
                        .expect("Failed to decode")
                        .resize_exact(IMAGE_SIZE, IMAGE_SIZE, FilterType::CatmullRom)
                        .into_rgb8();

                let comparable = ComparableImage {
                    name: file_name.clone(),
                    path: file.path.as_os_str().to_string_lossy().to_string(),
                    image,
                };

                s.send(comparable)
                    .expect("Failed to send image through channel");
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
