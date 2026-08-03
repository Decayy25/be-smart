export enum ROLES {
  STUDENT = "STUDENT",
  TEACHER = "TEACHER",
  STAFF = "STAFF",
}

export enum STATUS {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED",
  SUSPENDED = "SUSPENDED",
}

export enum APPROVE {
  APPROVED = "APPROVED",
  PENDING = "PENDING",
  NOT_APPROVE = "NOT_APPROVE",
  PENDING_PAYMENT = "PENDING_PAYMENT",
  DAPODIK_ISSUE = "DAPODIK_ISSUE",
  DATA_ISSUE = "DATA_ISSUE",
}

export enum EDUCATION_LEVEL {
  D3 = "D3",
  D4 = "D4",
  S1 = "S1",
  S2 = "S2",
  S3 = "S3",
}

export enum POSITION {
  PRINCIPAL = "Kepala_Sekolah",
  VICE_PRINCIPAL = "Wakil_Kepala_Sekolah",
  COORDINATOR = "Koordinator",
  HOMEROOM_TEACHER = "Wali_Kelas",
  GUIDANCE_COUNSELOR = "Guru_BK",
  HEAD_OF_PROGRAM = "Kepala_Program_Keahlian",
  PKL_COORDINATOR = "Koordinator_PKL",
  OSIS_ADVISOR = "Pembina_OSIS",
  LAB_COORDINATOR = "Kepala_Laboratorium",
  EXTRACURRICULAR_ADVISOR = "Pembina_Ekstrakurikuler",
}

export enum STAFF_DEPARTMENT {
  ADMINISTRATION = "Administrasi",
  COOPERATIVE = "Koperasi",
  FINANCE = "Keuangan",
  LIBRARY = "Perpustakaan",
  LABORATORY = "Laboratorium",
  IT = "Teknologi_Informasi",
  SECURITY = "Keamanan",
  CLEANING_SERVICE = "Kebersihan",
}

export enum EMPLOYMENT_STATUS {
  PERMANENT = "Tetap",
  CONTRACT = "Kontrak",
  HONORARY = "Honorer",
  INTERN = "Magang",
}