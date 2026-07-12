import { ROLES } from "../utils/constant";

export type TRegisterBase = {
    name: string;
    email: string;
    nik_ktp: number;
    phoneNumber: number;
    password: string;
    confimPassword: string
};

export type TRegisterStudent = TRegisterBase & {
    roles: ROLES.STUDENT | "STUDENT";
    parentName: string;
    parentPhone: string;
};

export type TRegisterTeacher = TRegisterBase & {
    roles: ROLES.TEACHER | "TEACHER";
    nuptk: number;
    nip: number;
};

export type TRegisterStaff = TRegisterBase & {
    roles: ROLES.STAFF | "STAFF";
    nip: number;
    position: string;
    departement?: string;
};

export type TRegister = TRegisterStudent | TRegisterTeacher | TRegisterStaff;

export type TRegisterRole = ROLES.STUDENT | ROLES.TEACHER | ROLES.STAFF;