
"""Prepare the Kaggle phishing_site_urls.csv dataset.

Expected source columns:
    URL   : website URL
    Label : 'good' or 'bad'

Output:
    data/urls.csv with columns url,label
    label 0 = legitimate, 1 = phishing
"""

import argparse
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
OUTPUT_FILE = DATA_DIR / "urls.csv"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "source",
        nargs="?",
        default="data/phishing_site_urls.csv",
        help="Path to the downloaded Kaggle CSV",
    )
    args = parser.parse_args()

    source = Path(args.source)
    if not source.is_absolute():
        source = BASE_DIR / source

    if not source.is_file():
        raise FileNotFoundError(f"Dataset not found: {source}")

    df = pd.read_csv(source, encoding="utf-8-sig")

    # Match column names without depending on capitalization.
    columns = {str(c).strip().lower(): c for c in df.columns}
    url_col = columns.get("url")
    label_col = columns.get("label")

    if url_col is None or label_col is None:
        raise ValueError(
            f"Expected URL and Label columns; found {list(df.columns)}"
        )

    out = pd.DataFrame({
        "url": df[url_col].astype("string").str.strip(),
        "raw_label": df[label_col].astype("string").str.strip().str.lower(),
    })

    # This script intentionally accepts Kaggle's good/bad labels only.
    # Do not silently guess the meaning of numeric labels from another dataset.
    label_map = {"good": 0, "bad": 1}
    invalid_labels = sorted(
        set(out["raw_label"].dropna().unique()) - set(label_map)
    )

    if invalid_labels:
        raise ValueError(
            f"Unexpected labels: {invalid_labels}. "
            "Expected only 'good' and 'bad'."
        )

    out["label"] = out["raw_label"].map(label_map)
    out = out.drop(columns=["raw_label"])

    # Remove missing and empty URLs.
    out = out.dropna(subset=["url", "label"])
    out = out[out["url"].str.len() > 0]

    # Remove exact duplicate URLs.
    # If an identical URL has conflicting labels, reject it instead of
    # arbitrarily choosing one label.
    conflicts = (
        out.groupby("url")["label"].nunique()
    )
    conflicting_urls = conflicts[conflicts > 1].index

    if len(conflicting_urls):
        print(f"Removing {len(conflicting_urls)} URLs with conflicting labels.")
        out = out[~out["url"].isin(conflicting_urls)]

    out = out.drop_duplicates(subset=["url"]).reset_index(drop=True)
    out["label"] = out["label"].astype(int)

    counts = out["label"].value_counts().to_dict()
    if set(counts) != {0, 1}:
        raise ValueError(
            f"Both classes are required after cleaning. Counts: {counts}"
        )

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    out.to_csv(OUTPUT_FILE, index=False)

    print(f"Source: {source}")
    print(f"Saved: {OUTPUT_FILE}")
    print(f"Total unique URLs: {len(out):,}")
    print(f"Legitimate (0): {counts[0]:,}")
    print(f"Phishing (1):   {counts[1]:,}")
    print("Class distribution preserved; no artificial balancing performed.")


if __name__ == "__main__":
    main()
