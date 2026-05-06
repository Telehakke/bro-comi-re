use std::io::{Cursor, Read};
use wasm_bindgen::prelude::*;
use zip::ZipArchive;

#[wasm_bindgen]
pub struct ZipManager {
    archive: ZipArchive<Cursor<Vec<u8>>>,
}

#[wasm_bindgen]
impl ZipManager {
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<u8>) -> Result<ZipManager, JsValue> {
        let reader = Cursor::new(data);
        let archive = ZipArchive::new(reader).map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(ZipManager { archive })
    }

    // zipファイル内のファイル名を取得
    pub fn get_file_name(&self) -> Vec<JsValue> {
        self.archive.file_names().map(JsValue::from_str).collect()
    }

    // 指定したファイル名のデータをメモリ上に解凍する
    pub fn decompress_file(&mut self, name: &str) -> Result<Vec<u8>, JsValue> {
        let mut file = self
            .archive
            .by_name(name)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        let mut buffer = Vec::with_capacity(file.size() as usize);
        file.read_to_end(&mut buffer)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(buffer)
    }

    // メモリの解放
    pub fn free(self) {}
}
