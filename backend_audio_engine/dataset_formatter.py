"""
ZentryOS — Automated Dataset Formatter & Vocal Isolation Pipeline
Basado en: gokhaneraslan/XTTS_V2-finetuning & SayanoAI/RVC-Studio
"""

import os
import shutil
from pathlib import Path
from typing import List, Tuple
import torchaudio
import torch

class AudioPreprocessor:
    def __init__(self, target_sample_rate: int = 24000):
        self.target_sr = target_sample_rate

    def normalize_and_resample(self, input_path: str, output_path: str) -> None:
        """Carga audio, convierte a mono, remuestrea a 24kHz y normaliza a -1.0dB peak."""
        waveform, sr = torchaudio.load(input_path)
        
        # Convertir a mono si es multicanal
        if waveform.shape[0] > 1:
            waveform = torch.mean(waveform, dim=0, keepdim=True)
            
        # Remuestrear si difiere del target
        if sr != self.target_sr:
            resampler = torchaudio.transforms.Resample(sr, self.target_sr)
            waveform = resampler(waveform)
            
        # Normalización Peak a -1.0dBFS (0.89125) para prevenir saturación y fondo sucio
        max_val = torch.max(torch.abs(waveform))
        if max_val > 0:
            waveform = (waveform / max_val) * 0.89125
            
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        torchaudio.save(output_path, waveform, self.target_sr)

    def generate_xtts_dataset_manifest(
        self, 
        audio_dir: str, 
        transcripts: List[Tuple[str, str]], 
        speaker_name: str,
        output_dir: str
    ) -> str:
        """
        Genera el archivo metadata.csv con la estructura estándar de Coqui XTTS v2:
        audio_file|text|speaker_name
        """
        os.makedirs(output_dir, exist_ok=True)
        wavs_dir = os.path.join(output_dir, "wavs")
        os.makedirs(wavs_dir, exist_ok=True)
        
        manifest_path = os.path.join(output_dir, "metadata.csv")
        with open(manifest_path, "w", encoding="utf-8") as f:
            for audio_file, text in transcripts:
                src_path = os.path.join(audio_dir, audio_file)
                dst_path = os.path.join(wavs_dir, audio_file)
                
                # Preprocesar audio
                self.normalize_and_resample(src_path, dst_path)
                
                # Escribir línea formateada
                f.write(f"wavs/{audio_file}|{text.strip()}|{speaker_name}\n")
                
        return manifest_path
