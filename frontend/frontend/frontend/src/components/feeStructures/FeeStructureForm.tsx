import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  createFeeStructure,
  updateFeeStructure,
  type FeeStructure,
} from "../../api/feeStructures";

import {
  getAcademicYears,
  getClasses,
  type AcademicYear,
  type ClassItem,
} from "../../api/lookups";

import ModuleModal from "../common/ModuleModal";

import {
  ErrorBox,
  Field,
  inputClass,
  PrimaryButton,
} from "../common/ModuleUi";

interface FeeStructureFormProps {
  feeStructure?: FeeStructure | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export default function FeeStructureForm({
  feeStructure,
  onClose,
  onSuccess,
}: FeeStructureFormProps) {
  const isEdit = Boolean(feeStructure);

  const [years, setYears] =
    useState<AcademicYear[]>([]);
  const [classes, setClasses] =
    useState<ClassItem[]>([]);

  const [yearId, setYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [type, setType] = useState("TUITION");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void Promise.all([
      getAcademicYears(),
      getClasses(),
    ])
      .then(([yearList, classList]) => {
        setYears(yearList);
        setClasses(classList);
      })
      .catch((e: any) => {
        setError(
          e?.response?.data?.detail ??
            "Unable to load options."
        );
      });
  }, []);

  useEffect(() => {
    if (!feeStructure) {
      setYearId("");
      setClassId("");
      setType("TUITION");
      setAmount("");
      setDueDate("");
      return;
    }

    setYearId(
      String(feeStructure.academic_year_id)
    );
    setClassId(String(feeStructure.class_id));
    setType(feeStructure.fee_type);
    setAmount(String(feeStructure.amount));
    setDueDate(feeStructure.due_date);
  }, [feeStructure]);

  const visibleClasses = classes.filter(
    (item) =>
      !yearId ||
      item.academic_year_id === Number(yearId)
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (
      !yearId ||
      !classId ||
      !type.trim() ||
      !amount ||
      !dueDate
    ) {
      setError("All fields are required.");
      return;
    }

    if (Number(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      if (feeStructure) {
        await updateFeeStructure(
          feeStructure.id,
          {
            fee_type: type.trim(),
            amount: Number(amount),
            due_date: dueDate,
          }
        );
      } else {
        await createFeeStructure({
          academic_year_id: Number(yearId),
          class_id: Number(classId),
          fee_type: type.trim(),
          amount: Number(amount),
          due_date: dueDate,
        });
      }

      await onSuccess();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          `Unable to ${
            isEdit ? "update" : "create"
          } fee structure.`
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModuleModal
      title={
        isEdit
          ? "Edit Fee Structure"
          : "Create Fee Structure"
      }
      onClose={onClose}
    >
      <form
        onSubmit={submit}
        className="space-y-5"
      >
        {error && <ErrorBox message={error} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Academic Year"
            required
          >
            <select
              className={inputClass}
              value={yearId}
              onChange={(e) =>
                setYearId(e.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select year
              </option>

              {years.map((year) => (
                <option
                  key={year.id}
                  value={year.id}
                >
                  {year.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Class" required>
            <select
              className={inputClass}
              value={classId}
              onChange={(e) =>
                setClassId(e.target.value)
              }
              disabled={isEdit}
            >
              <option value="">
                Select class
              </option>

              {visibleClasses.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fee Type" required>
            <input
              className={inputClass}
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              placeholder="TUITION"
            />
          </Field>

          <Field label="Amount" required>
            <input
              type="number"
              min="0.01"
              step="0.01"
              className={inputClass}
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              placeholder="50000"
            />
          </Field>

          <Field label="Due Date" required>
            <input
              type="date"
              className={inputClass}
              value={dueDate}
              onChange={(e) =>
                setDueDate(e.target.value)
              }
            />
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 hover:bg-slate-100"
          >
            Cancel
          </button>

          <PrimaryButton
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : isEdit
                ? "Update Fee"
                : "Create Fee"}
          </PrimaryButton>
        </div>
      </form>
    </ModuleModal>
  );
}