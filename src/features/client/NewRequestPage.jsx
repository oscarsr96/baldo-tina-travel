import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import TripForm from "../../components/TripForm";

export default function NewRequestPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data) => {
    const { error } = await supabase.from("trip_requests").insert({
      client_id: user.id,
      travelers: data.travelers,
      selected_cities: data.selectedCities,
      total_days: data.totalDays,
      budget: data.budget,
      preferences: data.preferences,
      notes: data.notes || null,
    });

    if (error) {
      toast.error("Error al enviar la solicitud");
      return;
    }

    toast.success("Solicitud enviada correctamente");
    navigate("/dashboard");
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-text mb-6">Nueva solicitud de viaje</h2>
      <div className="bg-card border border-border rounded-xl p-6">
        <TripForm onSubmit={handleSubmit} mode="client" submitLabel="Enviar solicitud" />
      </div>
    </div>
  );
}
