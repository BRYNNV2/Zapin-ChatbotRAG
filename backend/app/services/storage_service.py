import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional, List, Dict, Any
from app.core.config import settings

class R2StorageService:
    """Layanan integrasi Cloudflare R2 (S3-Compatible Object Storage)
    
    Digunakan untuk menyimpan dan mengambil naskah PDF asli tari Zapin.
    """
    
    def __init__(self):
        self.bucket_name = settings.R2_BUCKET_NAME
        self.client = None
        self._initialize_client()
        
    def _initialize_client(self):
        if settings.R2_ACCOUNT_ID and settings.R2_ACCESS_KEY_ID and settings.R2_SECRET_ACCESS_KEY:
            endpoint_url = f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
            try:
                self.client = boto3.client(
                    "s3",
                    endpoint_url=endpoint_url,
                    aws_access_key_id=settings.R2_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
                    region_name="auto"
                )
                print(f"[R2Storage] Terhubung ke Cloudflare R2 Bucket: {self.bucket_name}")
            except Exception as e:
                print(f"[R2Storage] Gagal inisialisasi koneksi Cloudflare R2: {e}")
                self.client = None
        else:
            self.client = None

    def is_configured(self) -> bool:
        """Mengecek apakah kredensial Cloudflare R2 sudah lengkap."""
        return self.client is not None

    def upload_file(self, file_path: str, object_name: Optional[str] = None, content_type: str = "application/pdf") -> Optional[str]:
        """Mengunggah file dari path lokal ke bucket Cloudflare R2."""
        if not self.is_configured():
            return None

        if object_name is None:
            object_name = os.path.basename(file_path)

        try:
            extra_args = {"ContentType": content_type}
            self.client.upload_file(file_path, self.bucket_name, object_name, ExtraArgs=extra_args)
            return self.get_file_url(object_name)
        except ClientError as e:
            print(f"[R2Storage] Error upload {object_name}: {e}")
            return None

    def upload_bytes(self, file_bytes: bytes, object_name: str, content_type: str = "application/pdf") -> Optional[str]:
        """Mengunggah file dalam bentuk bytes langsung ke Cloudflare R2."""
        if not self.is_configured():
            return None

        try:
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=object_name,
                Body=file_bytes,
                ContentType=content_type
            )
            return self.get_file_url(object_name)
        except ClientError as e:
            print(f"[R2Storage] Error upload bytes {object_name}: {e}")
            return None

    def get_file_url(self, object_name: str, expires_in: int = 3600) -> str:
        """Mendapatkan URL file untuk diakses pengguna (Public URL atau Pre-signed URL)."""
        if settings.R2_PUBLIC_URL:
            base_url = settings.R2_PUBLIC_URL.rstrip('/')
            return f"{base_url}/{object_name}"

        if not self.is_configured():
            return f"/api/dataset/documents/{object_name}"

        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": object_name},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            print(f"[R2Storage] Error generate presigned URL: {e}")
            return ""

    def download_file(self, object_name: str, dest_path: str) -> bool:
        """Mengunduh file dari R2 ke disk lokal."""
        if not self.is_configured():
            return False

        try:
            os.makedirs(os.path.dirname(dest_path), exist_ok=True)
            self.client.download_file(self.bucket_name, object_name, dest_path)
            return True
        except ClientError as e:
            print(f"[R2Storage] Error download {object_name}: {e}")
            return False

    def list_files(self, prefix: str = "") -> List[Dict[str, Any]]:
        """Melihat daftar seluruh file yang ada di bucket R2."""
        if not self.is_configured():
            return []

        try:
            response = self.client.list_objects_v2(Bucket=self.bucket_name, Prefix=prefix)
            contents = response.get("Contents", [])
            files = []
            for item in contents:
                files.append({
                    "name": item["Key"],
                    "size": item["Size"],
                    "last_modified": item["LastModified"].isoformat(),
                    "url": self.get_file_url(item["Key"])
                })
            return files
        except ClientError as e:
            print(f"[R2Storage] Error list files: {e}")
            return []

    def delete_file(self, object_name: str) -> bool:
        """Menghapus file dari bucket Cloudflare R2."""
        if not self.is_configured():
            return False

        try:
            self.client.delete_object(Bucket=self.bucket_name, Key=object_name)
            return True
        except ClientError as e:
            print(f"[R2Storage] Error delete {object_name}: {e}")
            return False

storage_service = R2StorageService()
