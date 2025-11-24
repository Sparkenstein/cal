'use client';

import { deleteActivity, updateActivity } from "@/app/actions";
import { Trash2, Edit2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#84cc16', // lime
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#d946ef', // fuchsia
  '#f43f5e', // rose
  '#111827', // black
];

interface ActivityActionsProps {
  activityId: string;
  initialName: string;
  initialColor: string;
}

export function ActivityActions({ activityId, initialName, initialColor }: ActivityActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [name, setName] = useState(initialName);
  const router = useRouter();

  const handleDelete = () => {
    if (confirm("Are you sure? This will delete the activity and ALL its logs permanently.")) {
      startTransition(async () => {
        await deleteActivity(activityId);
      });
    }
  };

  const handleUpdate = (formData: FormData) => {
    formData.set('color', selectedColor);
    startTransition(async () => {
      await updateActivity(activityId, formData);
      setIsEditOpen(false);
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsEditOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
        >
          <Edit2 size={16} />
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          Delete Activity
        </button>
      </div>

      {isEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="font-semibold text-gray-900">Edit Activity</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form action={handleUpdate} className="p-4 flex flex-col gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color tag
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-70"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
