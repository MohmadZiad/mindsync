@@ .. @@
 import { useForm, FormProvider } from "react-hook-form"; // ✅ أضفنا FormProvider
 import { zodResolver } from "@hookform/resolvers/zod";
import { useSchemas } from "@/hooks/schemas";
+import { useSchemas } from "@/hooks/schemas";
 import { useAppDispatch, useAppSelector } from "@/redux/hooks";
 import { addEntry, fetchEntries } from "@/redux/slices/entrySlice";
 import { SideSheet } from "@/components/primitives/SideSheet";
 import toast from "react-hot-toast";
 import { useI18n } from "@/ui/i18n";
import NoteModal, { type NotePayload } from "../components/NoteModal";
+import NoteModal, { type NotePayload } from "@/features/entries/components/NoteModal";
 import { EntryTemplates } from "./EntryTemplates";