from typing import Dict, List
from app.utils.file_parser import parse_dataset_file
from app.database import (
    insert_knowledge_item, 
    insert_dataset_version, 
    get_all_knowledge_items, 
    get_all_variations
)
from app.services.question_matcher import global_matcher

def process_and_index_dataset(file_content: bytes, filename: str, uploaded_by: str = "admin") -> Dict:
    """
    Parses, validates, stores, and automatically indexes uploaded dataset.
    """
    valid_records, total_rows, valid_count, invalid_count, duplicate_count = parse_dataset_file(file_content, filename)

    # Get latest dataset version number
    from app.database import get_all_dataset_versions
    versions = get_all_dataset_versions()
    version_num = len(versions) + 1
    version_name = f"Version {version_num}"

    # 1. Insert dataset version record
    version_record = insert_dataset_version({
        "version_name": version_name,
        "filename": filename,
        "uploaded_by": uploaded_by,
        "total_rows": total_rows,
        "valid_rows": valid_count,
        "invalid_rows": invalid_count,
        "duplicate_rows": duplicate_count,
        "status": "active"
    })

    # 2. Insert valid knowledge items
    for rec in valid_records:
        rec["dataset_version"] = version_num
        insert_knowledge_item(rec)

    # 3. Rebuild Question Matcher index automatically (Instant availability)
    reindex_knowledge_base()

    return {
        "success": True,
        "message": "Knowledge base updated successfully.",
        "total_rows": total_rows,
        "valid_rows": valid_count,
        "invalid_rows": invalid_count,
        "duplicate_rows": duplicate_count,
        "dataset_version": version_num
    }

def reindex_knowledge_base():
    """Fetches all active knowledge items & variations and rebuilds TF-IDF index."""
    items = get_all_knowledge_items(active_only=True)
    variations = get_all_variations()
    global_matcher.build_index(items, variations)
