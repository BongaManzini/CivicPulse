"""
CivicPulse Gauteng — Pickle Model Builder & Inference Engine
Generates, serializes (.pkl), loads, and executes predictions using the Ridge CV voter turnout model.
"""

import os
import sys
import argparse
import pickle
import joblib
import numpy as np
import pandas as pd

from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.linear_model import RidgeCV

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
SRC_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "src", "data")

VD_PATH = os.path.join(DATA_DIR, "vd_scored_2021.csv")
WARD_PATH = os.path.join(DATA_DIR, "ward_table.csv")

PKL_MODEL_PATH = os.path.join(DATA_DIR, "turnout_model.pkl")
PKL_FORECAST_PATH = os.path.join(DATA_DIR, "forecast_model_2026.pkl")
SRC_PKL_MODEL_PATH = os.path.join(SRC_DATA_DIR, "turnout_model.pkl")

NUM_FEATS = [
    'log_registered', 'margin', 'enp', 'share_ANC', 'share_DA',
    'share_EFF', 'share_ActionSA', 'tent_share', 'deprivation_score'
]
CAT_FEATS = ['station_type', 'winner_grp', 'metro']
TARGET = 'turnout'

def load_dataset():
    if not os.path.exists(VD_PATH):
        raise FileNotFoundError(f"Data file not found at {VD_PATH}")

    vd21 = pd.read_csv(VD_PATH)
    wt = pd.read_csv(WARD_PATH) if os.path.exists(WARD_PATH) else None

    if wt is not None:
        drop_cols = ['metro', 'registered', 'valid', 'spoilt', 'turnout', 'spoilt_rate', 'n_vd', 'pred_turnout', 'tent_share']
        M = vd21.merge(wt.drop(columns=[c for c in drop_cols if c in wt.columns], errors='ignore'), on='ward_id', how='left')
    else:
        M = vd21.copy()

    if 'registered' in M.columns and 'log_registered' not in M.columns:
        M['log_registered'] = np.log1p(M['registered'])
    if 'winner' in M.columns and 'winner_grp' not in M.columns:
        M['winner_grp'] = M['winner']
    if 'tent' in M.columns and 'tent_share' not in M.columns:
        M['tent_share'] = M['tent']

    return M, wt

def build_and_save_pkl():
    print("=" * 70)
    print("🗳️ CivicPulse: Training & Serializing Models to .pkl format")
    print("=" * 70)

    M, wt = load_dataset()

    num_cols = [c for c in NUM_FEATS if c in M.columns]
    cat_cols = [c for c in CAT_FEATS if c in M.columns]

    X = M[num_cols + cat_cols]
    y = M[TARGET]

    print(f"Training Dataset: {len(X)} Voting Districts | Features ({len(num_cols + cat_cols)}): {num_cols + cat_cols}")

    # Preprocessing Pipeline
    prep = ColumnTransformer([
        ('n', Pipeline([
            ('imp', SimpleImputer(strategy='median')),
            ('sc', StandardScaler())
        ]), num_cols),
        ('c', Pipeline([
            ('imp', SimpleImputer(strategy='most_frequent')),
            ('oh', OneHotEncoder(handle_unknown='ignore'))
        ]), cat_cols)
    ])

    # Model Pipeline (Ridge Regularized Regression - 1-SE Rule)
    model = Pipeline([
        ('prep', prep),
        ('m', RidgeCV(alphas=np.logspace(-3, 3, 30)))
    ])

    # Train Final Model
    model.fit(X, y)
    print(f"✓ Ridge Model successfully trained! Chosen Alpha: {model.named_steps['m'].alpha_:.4f}")

    # 1. Save using standard Python pickle (.pkl)
    with open(PKL_MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"✓ Saved pickle model to: {PKL_MODEL_PATH}")

    # Copy to src/data as well for web app reference
    os.makedirs(SRC_DATA_DIR, exist_ok=True)
    with open(SRC_PKL_MODEL_PATH, 'wb') as f:
        pickle.dump(model, f)
    print(f"✓ Saved duplicate pickle model to: {SRC_PKL_MODEL_PATH}")

    # 2. Save 2026 forecast model if ward table exists
    if wt is not None and 'forecast_2026' in wt.columns:
        with open(PKL_FORECAST_PATH, 'wb') as f:
            pickle.dump(model, f)
        print(f"✓ Saved 2026 forecast pickle model to: {PKL_FORECAST_PATH}")

    print("=" * 70)
    return model

def load_and_predict_pkl(sample_ward_id=None):
    print("\n" + "=" * 70)
    print("🔍 Loading .pkl model & Executing Inference Test")
    print("=" * 70)

    if not os.path.exists(PKL_MODEL_PATH):
        raise FileNotFoundError(f"Pickle file missing: {PKL_MODEL_PATH}. Run training first.")

    # Load model from .pkl file using Python pickle
    with open(PKL_MODEL_PATH, 'rb') as f:
        loaded_model = pickle.load(f)

    print(f"✓ Successfully deserialized model from {PKL_MODEL_PATH}")
    print(f"  Model Type: {type(loaded_model).__name__}")
    print(f"  Pipeline Steps: {[step[0] for step in loaded_model.steps]}")

    M, _ = load_dataset()
    num_cols = [c for c in NUM_FEATS if c in M.columns]
    cat_cols = [c for c in CAT_FEATS if c in M.columns]

    if sample_ward_id:
        subset = M[M['ward_id'].astype(str).str.contains(sample_ward_id, case=False, na=False)]
        if subset.empty:
            print(f"Ward '{sample_ward_id}' not found. Defaulting to top 5 VDs.")
            subset = M.head(5)
    else:
        subset = M.head(5)

    X_test = subset[num_cols + cat_cols]
    actual_turnout = subset[TARGET].values

    # Run inference using loaded .pkl model
    predictions = loaded_model.predict(X_test)

    display_cols = [c for c in ['ward_id', 'station', 'station_name', 'metro', 'turnout'] if c in subset.columns]
    results_df = subset[display_cols].copy()
    results_df['pkl_predicted_turnout'] = np.round(predictions, 4)
    results_df['actual_turnout'] = np.round(actual_turnout, 4)
    results_df['abs_error_pp'] = np.round(np.abs(predictions - actual_turnout) * 100, 2)

    print("\nInference Results using deserialized .pkl model:")
    print(results_df.to_string(index=False))
    print("=" * 70)

    return results_df

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="CivicPulse PKL Model Builder & Inference Engine")
    parser.add_argument("--predict", type=str, help="Ward ID or metro search string for predicting turnout")
    args = parser.parse_args()

    # Step 1: Train & Create PKL file
    build_and_save_pkl()

    # Step 2: Use PKL file to run inference
    load_and_predict_pkl(sample_ward_id=args.predict)
