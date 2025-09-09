import pandas as pd
from sklearn.preprocessing import LabelEncoder
import joblib
import os

# Khởi tạo LabelEncoders
label_encoders = {
    "location": LabelEncoder(),
    "day_of_week": LabelEncoder(),
    "weather": LabelEncoder()
}

def fit_label_encoders(df: pd.DataFrame) -> dict:
    """
    Fit LabelEncoders trên dữ liệu huấn luyện.
    """
    for col in ["location", "day_of_week", "weather"]:
        if col in df.columns and df[col].dtype == object:
            label_encoders[col].fit(df[col])
    return label_encoders

def load_label_encoders() -> dict:
    """
    Load các encoder đã lưu từ đĩa.
    """
    encoders = {}
    for col in ["location", "day_of_week", "weather"]:
        encoder_path = os.path.join("models", f"{col}_encoder.joblib")
        if not os.path.exists(encoder_path):
            raise FileNotFoundError(f"Encoder for {col} not found at {encoder_path}")
        encoders[col] = joblib.load(encoder_path)
    return encoders

def preprocess_input(df: pd.DataFrame, is_training: bool = False) -> pd.DataFrame:
    """
    Tiền xử lý dữ liệu đầu vào cho mô hình.
    """
    required_cols = ["location", "hour", "day_of_week", "weather"]

    # Kiểm tra thiếu cột
    for col in required_cols:
        if col not in df.columns:
            raise ValueError(f"Missing required column: {col}")

    # Kiểm tra giá trị null
    if df[required_cols].isnull().any().any():
        raise ValueError("Input contains null values")

    # Kiểm tra giá trị giờ
    if not (0 <= df["hour"].min() <= 23 and 0 <= df["hour"].max() <= 23.5):
        raise ValueError("Hour values must be between 0 and 23.5")

    # Copy tránh thay đổi dữ liệu gốc
    df = df.copy()

    # Fit hoặc load encoders
    encoders = fit_label_encoders(df) if is_training else load_label_encoders()

    # Encode các cột phân loại
    for col in ["location", "day_of_week", "weather"]:
        if df[col].dtype == object:
            if not is_training:
                unknown_values = set(df[col]) - set(encoders[col].classes_)
                if unknown_values:
                    raise ValueError(
                        f"Invalid input: Unknown values in {col}: {unknown_values}. "
                        f"Allowed values: {list(encoders[col].classes_)}"
                    )
            df[col] = encoders[col].transform(df[col])

    return df[["location", "hour", "day_of_week", "weather"]]
