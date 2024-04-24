import { createStorage } from "unstorage";
import fsLiteDriver from "unstorage/drivers/fs-lite";

type User = {
  id: number;
  name: string[];
  password: string;
  doctor?: boolean;
  can_prescribe?: string[];
};

type Medicine = {
  id: number;
  name: string;
};

type Prescription = {
  id: number;
  patient_id: number;
  doctor_id: number;
  medicines: { medicine_id: number; quantity: number }[];
};

type IdType = "prescription" | "medicine" | "user";

const storage = createStorage({
  driver: fsLiteDriver({
    base: "./.data",
  }),
});

storage.setItem("users:data", []);
storage.setItem("users:counter", 0);
storage.setItem("medicines:data", []);
storage.setItem("medicines:counter", 0);
storage.setItem("prescriptions:data", []);
storage.setItem("prescriptions:counter", 0);

async function createId(type: IdType): Promise<number> {
  const counter = await storage.getItem(`${type}s:counter`);
  await storage.setItem(`${type}s:counter`, (counter as number) + 1);
  return counter as number;
}

function validatePassword(password: string): Error | undefined {
  if (typeof password !== "string" || password.length < 6) {
    return new Error("Passwords must be at least 6 characters long");
  }
}

export const db = {
  validatePassword: validatePassword,
  user: {
    create: async (
      name: string[],
      password: string,
      doctor: boolean,
      can_prescribe: string[],
    ) => {
      const id = await createId("user");
      const user: User = { id, name, password, doctor, can_prescribe };
      const users = (await storage.getItem("users:data")) as User[];
      await storage.setItem("users:data", [...users, user]);
      return user;
    },
    delete: async (id: number) => {
      const users = (await storage.getItem("users:data")) as User[];
      await storage.setItem(
        "users:data",
        users.filter((user) => user.id !== id),
      );
    },
    find: async (name: string[]) => {
      const users = (await storage.getItem("users:data")) as User[];
      return users.find((user) => user.name === name);
    },
    update: async (user: User) => {
      const users = (await storage.getItem("users:data")) as User[];
      await storage.setItem(
        "users:data",
        users.map((u) => (u.id === user.id ? user : u)),
      );
    },
    get: async (id: number) => {
      const users = (await storage.getItem("users:data")) as User[];
      return users.find((user) => user.id === id);
    },
  },
  medicine: {
    create: async (name: string) => {
      const id = await createId("medicine");
      const medicine: Medicine = { id, name };
      const medicines = (await storage.getItem("medicines:data")) as Medicine[];
      await storage.setItem("medicines:data", [...medicines, medicine]);
      return medicine;
    },
    delete: async (id: number) => {
      const medicines = (await storage.getItem("medicines:data")) as Medicine[];
      await storage.setItem(
        "medicines:data",
        medicines.filter((medicine) => medicine.id !== id),
      );
    },
    find: async (name: string) => {
      const medicines = (await storage.getItem("medicines:data")) as Medicine[];
      return medicines.find((medicine) => medicine.name === name);
    },
    get: async (id: number) => {
      const medicines = (await storage.getItem("medicines:data")) as Medicine[];
      return medicines.find((medicine) => medicine.id === id);
    },
  },
  prescription: {
    create: async (
      patient_id: number,
      doctor_id: number,
      medicines: { medicine_id: number; quantity: number }[],
    ) => {
      const id = await createId("prescription");
      const prescription: Prescription = {
        id,
        patient_id,
        doctor_id,
        medicines,
      };
      const prescriptions = (await storage.getItem(
        "prescriptions:data",
      )) as Prescription[];
      await storage.setItem("prescriptions:data", [
        ...prescriptions,
        prescription,
      ]);
      return prescription;
    },
    delete: async (id: number) => {
      const prescriptions = (await storage.getItem(
        "prescriptions:data",
      )) as Prescription[];
      await storage.setItem(
        "prescriptions:data",
        prescriptions.filter((prescription) => prescription.id !== id),
      );
    },
    find: async (id: number) => {
      const prescriptions = (await storage.getItem(
        "prescriptions:data",
      )) as Prescription[];
      return prescriptions.find((prescription) => prescription.id === id);
    },
    update: async (prescription: Prescription) => {
      const prescriptions = (await storage.getItem(
        "prescriptions:data",
      )) as Prescription[];
      await storage.setItem(
        "prescriptions:data",
        prescriptions.map((p) => (p.id === prescription.id ? prescription : p)),
      );
    },
    get: async (id: number) => {
      const prescriptions = (await storage.getItem(
        "prescriptions:data",
      )) as Prescription[];
      return prescriptions.find((prescription) => prescription.id === id);
    },
  },
};
