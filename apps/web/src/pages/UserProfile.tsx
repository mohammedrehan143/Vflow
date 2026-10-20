import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePWA } from '../context/PWAContext';
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
  Download,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, role, logout, selectRole, refreshUser } = useAuth();
  const { openInstallFlow, isStandalone, isInstalled, isInstallable } = usePWA();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-white min-h-screen text-neutral-900">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
          <User className="w-4 h-4 stroke-[2.5]" />
          <span>Account Settings & Role Control</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 mt-1">Profile & Vehicles</h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
          Manage your personal details, role-based permissions, and registered vehicles linked to MongoDB & Supabase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Profile Details Card (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-400 text-black font-black text-2xl flex items-center justify-center shadow-xs border-2 border-neutral-900">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="font-black text-neutral-900 text-lg">{user?.fullName || 'Active User'}</h3>
              <span className="text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full bg-black text-yellow-400">
                {role === 'provider' ? 'Parking & Charging Host' : 'Customer / Driver'}
              </span>
            </div>
          </div>

          {/* Role Switching Section */}
          <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
            <span className="text-[11px] font-black text-neutral-500 uppercase block">Switch Account Role</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={roleChanging || role === 'customer'}
                onClick={() => handleRoleSwitch('customer')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  role === 'customer'
                    ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>Driver</span>
              </button>
              <button
                type="button"
                disabled={roleChanging || role === 'provider'}
                onClick={() => handleRoleSwitch('provider')}
                className={`py-2 px-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 active:scale-95 ${
                  role === 'provider'
                    ? 'bg-yellow-400 text-black shadow-xs border border-yellow-500/20'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Host</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-3 text-neutral-600 font-medium">
              <Mail className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>{user?.email || 'user@vflow.in'}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-600 font-medium">
              <Phone className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>{user?.phone || '+91 98888 33333'}</span>
            </div>
            <div className="flex items-center gap-3 text-neutral-600 font-medium">
              <Shield className="w-4 h-4 text-neutral-900 shrink-0" />
              <span>Identity Verified via Supabase Auth</span>
            </div>
          </div>

          {/* PWA App Installation Card */}
          <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-300 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-black" />
                <span className="font-black text-xs text-neutral-900">VFlow App (PWA)</span>
              </div>
              {isStandalone || isInstalled ? (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-black">
                  Installed
                </span>
              ) : (
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-800">
                  Available
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-700 leading-relaxed font-medium">
              {isStandalone
                ? "You are currently running VFlow in standalone app mode."
                : isInstalled
                ? "VFlow is installed on your device launcher or home screen."
                : "Install VFlow on your phone or desktop for lightning-fast reservations and offline support."}
            </p>
            {!isStandalone && (
              <div className="pt-1 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={openInstallFlow}
                  className="bg-black hover:bg-neutral-800 text-yellow-400 font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Install App</span>
                </button>
                <Link
                  to="/install-pwa"
                  className="text-[11px] font-black text-neutral-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>Manual Guide</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full mt-4 bg-neutral-100 hover:bg-red-50 text-neutral-700 hover:text-red-700 font-black py-2.5 px-4 rounded-xl text-xs border border-neutral-300 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Vehicles Card (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl p-6 border-2 border-neutral-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="font-black text-neutral-900 text-base">Registered Vehicles</h3>
              <p className="text-xs text-neutral-500 font-medium">Auto-checks charger compatibility and fast checkout</p>
            </div>
            <Link
              to="/vehicles"
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 border border-yellow-500/20 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Manage Vehicles</span>
            </Link>
          </div>

          {loadingVehicles ? (
            <div className="space-y-2">
              <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
              <div className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            </div>
          ) : vehicles.length > 0 ? (
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div
                  key={v._id}
                  className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 shrink-0">
                      {v.powertrain === 'electric' || v.powertrain === 'hybrid' ? (
                        <Zap className="w-5 h-5 text-black fill-yellow-400" />
                      ) : (
                        <Car className="w-5 h-5 text-neutral-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-black text-neutral-900 text-sm flex items-center gap-2">
                        <span>
                          {v.manufacturer} {v.model}
                        </span>
                        {v.isDefault && (
                          <span className="text-[10px] font-black text-black bg-yellow-400 px-2 py-0.5 rounded-md">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-500 font-medium">
                        {v.registrationNumber ? `${v.registrationNumber} · ` : ''}
                        {v.vehicleType.replace(/_/g, ' ')} · {v.powertrain}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => removeVehicle(v._id)}
                      className="p-2 text-neutral-400 hover:text-red-600 hover:bg-white rounded-lg transition"
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
                  className="text-xs font-black text-neutral-900 hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Full Vehicle Manager with Connectors & Power Limits</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <Car className="w-8 h-8 text-neutral-300 mx-auto" />
              <div className="text-xs text-neutral-500 font-medium">No vehicles registered yet.</div>
              <Link
                to="/vehicles"
                className="inline-block bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs px-4 py-2.5 rounded-xl transition shadow-xs"
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
