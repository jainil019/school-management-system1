import { useEffect, useMemo, useState } from "react";
import {
  getReportAttendance,
  getReportMarks,
  getReportParents,
  getReportPayments,
  getReportStudentFees,
  getReportStudents,
  getReportTeachers,
} from "../../api/reports";

import {
  CreditCard,
  GraduationCap,
  IndianRupee,
  Users,
  UserRound,
  ClipboardCheck,
  FileText,
  RefreshCw,
} from "lucide-react";

interface RecordData {
  id: number;
  [key: string]: any;
}

function getAmount(value: any): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export default function Reports() {
  const [students, setStudents] = useState<RecordData[]>([]);
  const [teachers, setTeachers] = useState<RecordData[]>([]);
  const [parents, setParents] = useState<RecordData[]>([]);
  const [attendance, setAttendance] = useState<RecordData[]>([]);
  const [marks, setMarks] = useState<RecordData[]>([]);
  const [studentFees, setStudentFees] = useState<RecordData[]>([]);
  const [payments, setPayments] = useState<RecordData[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentData,
        teacherData,
        parentData,
        attendanceData,
        marksData,
        feeData,
        paymentData,
      ] = await Promise.all([
        getReportStudents(),
        getReportTeachers(),
        getReportParents(),
        getReportAttendance(),
        getReportMarks(),
        getReportStudentFees(),
        getReportPayments(),
      ]);

      setStudents(studentData);
      setTeachers(teacherData);
      setParents(parentData);
      setAttendance(attendanceData);
      setMarks(marksData);
      setStudentFees(feeData);
      setPayments(paymentData);
    } catch (e: any) {
      setError(
        e?.response?.data?.detail ??
          "Unable to load reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReports();
  }, []);

  const totalDue = useMemo(
    () =>
      studentFees.reduce(
        (sum, fee) => sum + getAmount(fee.amount_due),
        0
      ),
    [studentFees]
  );

  const totalPaid = useMemo(
    () =>
      studentFees.reduce(
        (sum, fee) => sum + getAmount(fee.amount_paid),
        0
      ),
    [studentFees]
  );

  const totalPaymentAmount = useMemo(
    () =>
      payments.reduce(
        (sum, payment) => sum + getAmount(payment.amount),
        0
      ),
    [payments]
  );

  const pendingFees = studentFees.filter(
    (fee) => String(fee.status).toUpperCase() === "PENDING"
  ).length;

  const partialFees = studentFees.filter(
    (fee) => String(fee.status).toUpperCase() === "PARTIAL"
  ).length;

  const paidFees = studentFees.filter(
    (fee) => String(fee.status).toUpperCase() === "PAID"
  ).length;

  const recentPayments = [...payments]
    .sort(
      (a, b) =>
        new Date(b.paid_at ?? 0).getTime() -
        new Date(a.paid_at ?? 0).getTime()
    )
    .slice(0, 8);

  const cards = [
    {
      title: "Students",
      value: students.length,
      icon: GraduationCap,
    },
    {
      title: "Teachers",
      value: teachers.length,
      icon: Users,
    },
    {
      title: "Parents",
      value: parents.length,
      icon: UserRound,
    },
    {
      title: "Attendance Records",
      value: attendance.length,
      icon: ClipboardCheck,
    },
    {
      title: "Marks Records",
      value: marks.length,
      icon: FileText,
    },
    {
      title: "Total Fee Due",
      value: `₹${totalDue.toLocaleString()}`,
      icon: IndianRupee,
    },
    {
      title: "Total Fee Paid",
      value: `₹${totalPaid.toLocaleString()}`,
      icon: CreditCard,
    },
    {
      title: "Payments",
      value: payments.length,
      icon: CreditCard,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
          Loading reports...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of students, academics, attendance and finance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadReports()}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finance overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Fee Overview
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-slate-500">
                Total Due
              </span>
              <strong>
                ₹{totalDue.toLocaleString()}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">
                Total Paid
              </span>
              <strong>
                ₹{totalPaid.toLocaleString()}
              </strong>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">
                Remaining
              </span>
              <strong>
                ₹{Math.max(totalDue - totalPaid, 0).toLocaleString()}
              </strong>
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-amber-50 p-3">
                  <p className="text-xs text-amber-600">
                    Pending
                  </p>
                  <p className="mt-1 text-xl font-bold text-amber-700">
                    {pendingFees}
                  </p>
                </div>

                <div className="rounded-xl bg-blue-50 p-3">
                  <p className="text-xs text-blue-600">
                    Partial
                  </p>
                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {partialFees}
                  </p>
                </div>

                <div className="rounded-xl bg-green-50 p-3">
                  <p className="text-xs text-green-600">
                    Paid
                  </p>
                  <p className="mt-1 text-xl font-bold text-green-700">
                    {paidFees}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Payment Overview
          </h2>

          <div className="mt-5">
            <p className="text-sm text-slate-500">
              Total Recorded Payments
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              ₹{totalPaymentAmount.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {payments.length} payment record
              {payments.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
      </div>

      {/* Recent payments */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Payments
          </h2>
        </div>

        {!recentPayments.length ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">
                    Receipt
                  </th>

                  <th className="px-5 py-3">
                    Fee ID
                  </th>

                  <th className="px-5 py-3">
                    Amount
                  </th>

                  <th className="px-5 py-3">
                    Method
                  </th>

                  <th className="px-5 py-3">
                    Paid At
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {payment.receipt_no}
                    </td>

                    <td className="px-5 py-4">
                      #{payment.student_fee_id}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      ₹{getAmount(payment.amount).toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {payment.method}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {payment.paid_at
                        ? new Date(
                            payment.paid_at
                          ).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}