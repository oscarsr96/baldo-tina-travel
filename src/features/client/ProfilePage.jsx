import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone: phone || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Error al guardar");
      return;
    }
    toast.success("Perfil actualizado");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-6">Mi perfil</h2>
      <div className="bg-card border border-border rounded-xl p-6 max-w-md">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full bg-input/50 border border-border rounded-lg px-4 py-2.5 text-muted cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Nombre completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Teléfono</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-input border border-border rounded-lg px-4 py-2.5 text-text focus:outline-none focus:border-accent transition-colors"
              placeholder="+54 11 1234-5678"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-accent hover:bg-accent/90 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </div>
  );
}
