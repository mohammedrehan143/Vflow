import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Car,
  Zap,
  Mail,
  Phone,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, role, logout } = useAuth();

  const [vehicles, setVehicles] = useState([
    {
      id: 'v1',
      model: 'Tata Nexon EV Max',
      licensePlate: 'KA-01-MJ-4050',
      type: 'ev',
      isDefault: true,
    },
    {
      id: 'v2',
      model: 'Hyundai Creta',
      licensePlate: 'KA-03-NB-8821',
      type: 'suv',
      isDefault: false,
    },
  ]);

  const [newModel, setNewModel] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('ev');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel || !newPlate) return;
    setVehicles([
      ...vehicles,
      {
        id: `v_${Date.now()}`,
        model: newModel,
        licensePlate: newPlate,
        type: newType,
        isDefault: vehicles.length === 0,
      },
    ]);
    setNewModel('');
    setNewPlate('');
    setShowAddModal(false);
  };

  const removeVehicle = (id: string) => {
    setVehicles(vehicles.filter((v) => v.id !== id));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Account Settings</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Profile & Vehicles</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal details, registered vehicles, and security preferences
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Details Card (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">{user?.fullName || 'Guest Driver'}</h3>
              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {role || 'Customer'}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{user?.email || 'driver@vflow.in'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{user?.phone || '+91 98888 33333'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identity Verified via Supabase & Mobile OTP</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full mt-4 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold py-2.5 px-4 rounded-xl text-xs border border-slate-200 transition flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Vehicles Card (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Registered Vehicles</h3>
              <p className="text-xs text-slate-500">Auto-fills vehicle details during fast checkout</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="space-y-3">
            {vehicles.map((v) => (
              <div
                key={v.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700">
                    {v.type === 'ev' ? <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" /> : <Car className="w-5 h-5 text-slate-600" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{v.model}</span>
                      {v.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-500">{v.licensePlate}</div>
                  </div>
                </div>

                <button
                  onClick={() => removeVehicle(v.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showAddModal && (
            <form onSubmit={handleAddVehicle} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <h4 className="font-bold text-xs text-emerald-950 uppercase">Register New Vehicle</h4>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Make & Model (e.g. BMW i4)"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  required
                />
                <input
                  type="text"
                  placeholder="License Plate (e.g. DL-01-AB-9999)"
                  value={newPlate}
                  onChange={(e) => setNewPlate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
