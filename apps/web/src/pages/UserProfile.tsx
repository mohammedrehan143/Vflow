import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { IVehicle } from '@vflow/shared';
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
  ArrowRight,
  RefreshCw,
  Building2,
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, role, logout, selectRole, refreshUser } = useAuth();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [roleChanging, setRoleChanging] = useState(false);

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    try {
      const res = await api.vehicles.list();
      if (res.success && res.vehicles) {
        setVehicles(res.vehicles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVehicles(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleRoleSwitch = async (newRole: 'customer' | 'provider') => {
    setRoleChanging(true);
    try {
      await selectRole(newRole);
      await refreshUser();
    } catch (e: any) {
      alert(e.message || 'Failed to change role');
    } finally {
      setRoleChanging(false);
    }
  };

  const removeVehicle = async (id: string) => {
    if (!confirm('Remove this vehicle?')) return;
    try {
      await api.vehicles.delete(id);
      await fetchVehicles();
    } catch (e: any) {
      alert(e.message || 'Failed to remove vehicle');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
          <User className="w-4 h-4" />
          <span>Account Settings & Role Control</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Profile & Vehicles</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal details, role-based permissions, and registered vehicles linked to MongoDB & Supabase.
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
              <h3 className="font-extrabold text-slate-900 text-lg">{user?.fullName || 'Active User'}</h3>
              <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {role === 'provider' ? 'Parking & Charging Host' : 'Customer / Driver'}
              </span>
            </div>
          </div>

          {/* Role Switching Section */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Switch Account Role</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={roleChanging || role === 'customer'}
                onClick={() => handleRoleSwitch('customer')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  role === 'customer'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                disabled={roleChanging || role === 'provider'}
                onClick={() => handleRoleSwitch('provider')}
                className={`py-1.5 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  role === 'provider'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Host</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{user?.email || 'user@vflow.in'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{user?.phone || '+91 98888 33333'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Identity Verified via Supabase Auth</span>
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
              <p className="text-xs text-slate-500">Auto-checks charger compatibility and fast checkout</p>
            </div>
            <Link
              to="/vehicles"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-sm transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Manage Vehicles</span>
            </Link>
          </div>

          {loadingVehicles ? (
            <div className="space-y-2">
              <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            </div>
          ) : vehicles.length > 0 ? (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0">
                      {v.powertrain === 'electric' || v.powertrain === 'hybrid' ? (
                        <Zap className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                      ) : (
                        <Car className="w-5 h-5 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>
                          {v.manufacturer} {v.model}
                        </span>
                        {v.isDefault && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        {v.registrationNumber ? `${v.registrationNumber} · ` : ''}
                        {v.vehicleType} · {v.powertrain}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeVehicle(v._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-2 text-right">
                <Link
                  to="/vehicles"
                  className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full Vehicle Manager with Connectors & Power Limits</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Car className="w-8 h-8 text-slate-300 mx-auto" />
              <div className="text-xs text-slate-500">No vehicles registered yet.</div>
              <Link
                to="/vehicles"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
              >
                Add Your Vehicle Now
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
