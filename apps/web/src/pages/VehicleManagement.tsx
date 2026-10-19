import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  IVehicle,
  CustomerVehicleType,
  PowertrainType,
  ConnectorType,
  VEHICLE_TYPE_LABELS,
  POWERTRAIN_LABELS,
  CONNECTOR_TYPE_LABELS,
} from '@vflow/shared';
import {
  Car,
  Plus,
  Trash2,
  Check,
  Star,
  Zap,
  Fuel,
  BatteryCharging,
  AlertCircle,
  Edit2,
  X,
  Shield,
  Info,
} from 'lucide-react';

const COMMON_CONNECTORS: ConnectorType[] = [
  'Type 2',
  'CCS2',
  'CHAdeMO',
  'Bharat AC-001',
  'Bharat DC-001',
  '15A_3Pin',
];

export const VehicleManagement: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [vehicles, setVehicles] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);

  // Form fields
  const [vehicleType, setVehicleType] = useState<CustomerVehicleType>('electric_car');
  const [powertrain, setPowertrain] = useState<PowertrainType>('electric');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [selectedConnectors, setSelectedConnectors] = useState<ConnectorType[]>(['CCS2', 'Type 2']);
  const [maxAcPowerKw, setMaxAcPowerKw] = useState<string>('7.4');
  const [maxDcPowerKw, setMaxDcPowerKw] = useState<string>('50');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.vehicles.list();
      if (res.success) {
        setVehicles(res.vehicles || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchVehicles();
    }
  }, [isAuthenticated]);

  const resetForm = () => {
    setEditingVehicleId(null);
    setVehicleType('electric_car');
    setPowertrain('electric');
    setManufacturer('');
    setModel('');
    setRegistrationNumber('');
    setSelectedConnectors(['CCS2', 'Type 2']);
    setMaxAcPowerKw('7.4');
    setMaxDcPowerKw('50');
    setIsDefault(false);
    setError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (v: IVehicle) => {
    setEditingVehicleId(v._id);
    setVehicleType(v.vehicleType);
    setPowertrain(v.powertrain);
    setManufacturer(v.manufacturer);
    setModel(v.model);
    setRegistrationNumber(v.registrationNumber || '');
    setSelectedConnectors((v.supportedConnectorTypes as ConnectorType[]) || []);
    setMaxAcPowerKw(v.maxAcPowerKw ? String(v.maxAcPowerKw) : '');
    setMaxDcPowerKw(v.maxDcPowerKw ? String(v.maxDcPowerKw) : '');
    setIsDefault(!!v.isDefault);
    setShowModal(true);
  };

  const toggleConnector = (connector: ConnectorType) => {
    if (selectedConnectors.includes(connector)) {
      setSelectedConnectors(selectedConnectors.filter((c) => c !== connector));
    } else {
      setSelectedConnectors([...selectedConnectors, connector]);
    }
  };

  const handleVehicleTypeChange = (type: CustomerVehicleType) => {
    setVehicleType(type);
    if (type.startsWith('electric')) {
      setPowertrain('electric');
      if (selectedConnectors.length === 0) setSelectedConnectors(['Type 2', 'CCS2']);
    } else if (type.startsWith('petrol')) {
      setPowertrain('petrol');
      setSelectedConnectors([]);
    } else if (type.startsWith('diesel')) {
      setPowertrain('diesel');
      setSelectedConnectors([]);
    } else if (type.startsWith('hybrid')) {
      setPowertrain('hybrid');
      if (selectedConnectors.length === 0) setSelectedConnectors(['Type 2']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload = {
      vehicleType,
      powertrain,
      manufacturer: manufacturer.trim(),
      model: model.trim(),
      registrationNumber: registrationNumber.trim() ? registrationNumber.trim().toUpperCase() : undefined,
      supportedConnectorTypes: powertrain === 'electric' || powertrain === 'hybrid' ? selectedConnectors : [],
      maxAcPowerKw: maxAcPowerKw ? parseFloat(maxAcPowerKw) : undefined,
      maxDcPowerKw: maxDcPowerKw ? parseFloat(maxDcPowerKw) : undefined,
      isDefault,
    };

    try {
      if (editingVehicleId) {
        await api.vehicles.update(editingVehicleId, payload);
      } else {
        await api.vehicles.add(payload);
      }
      setShowModal(false);
      resetForm();
      await fetchVehicles();
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.vehicles.setDefault(id);
      await fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Failed to set default vehicle');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle from your account?')) return;
    try {
      await api.vehicles.delete(id);
      await fetchVehicles();
    } catch (err: any) {
      alert(err.message || 'Failed to remove vehicle');
    }
  };

  const isElectricCapable = powertrain === 'electric' || powertrain === 'hybrid';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Car className="w-8 h-8 text-emerald-600" />
            <span>My Vehicles & Compatibility</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your vehicles to automatically filter compatible EV chargers and parking spaces.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 text-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicle List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <BatteryCharging className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">No Vehicles Registered Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your EV or combustion vehicle to receive personalized compatibility checks and seamless parking bookings.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Vehicle Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {vehicles.map((v) => {
            const isEv = v.powertrain === 'electric' || v.powertrain === 'hybrid';
            return (
              <div
                key={v._id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 space-y-4 transition hover:shadow-lg relative ${
                  v.isDefault ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 shadow-sm'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isEv ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {isEv ? <Zap className="w-5 h-5 fill-emerald-600 text-emerald-600" /> : <Fuel className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {v.manufacturer} {v.model}
                        </h3>
                        {v.isDefault && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-emerald-600" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType} •{' '}
                        {POWERTRAIN_LABELS[v.powertrain] || v.powertrain}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Specs Pill List */}
                <div className="bg-slate-50 rounded-2xl p-3 space-y-2 border border-slate-100 text-xs">
                  {v.registrationNumber && (
                    <div className="flex justify-between items-center text-slate-600">
                      <span className="text-[11px] text-slate-400 uppercase font-bold">Plate / Reg</span>
                      <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {v.registrationNumber}
                      </span>
                    </div>
                  )}

                  {isEv && (
                    <>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Supported Inlets</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {v.supportedConnectorTypes && v.supportedConnectorTypes.length > 0 ? (
                            v.supportedConnectorTypes.map((c) => (
                              <span
                                key={c}
                                className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-md"
                              >
                                {CONNECTOR_TYPE_LABELS[c as ConnectorType] || c}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">None specified</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-slate-600">
                        <span className="text-[11px] text-slate-400 uppercase font-bold">Max Power Intake</span>
                        <div className="flex gap-2 text-[11px] font-semibold text-slate-700">
                          {v.maxAcPowerKw && <span>AC: {v.maxAcPowerKw} kW</span>}
                          {v.maxDcPowerKw && <span>DC: {v.maxDcPowerKw} kW</span>}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  {!v.isDefault ? (
                    <button
                      onClick={() => handleSetDefault(v._id)}
                      className="text-xs font-bold text-slate-600 hover:text-emerald-600 flex items-center gap-1.5 transition"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-400" />
                      <span>Set as Default Vehicle</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Used by default for instant booking
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900">
                {editingVehicleId ? 'Edit Vehicle Specifications' : 'Add New Customer Vehicle'}
              </h2>
              <p className="text-xs text-slate-500">
                Accurate vehicle specs ensure verified charger matching and avoid booking incompatible spots.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Vehicle Category</label>
                <select
                  value={vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value as CustomerVehicleType)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="electric_car">Electric Car (EV)</option>
                  <option value="hybrid_car">Hybrid Car (PHEV/HEV)</option>
                  <option value="petrol_car">Petrol Car</option>
                  <option value="diesel_car">Diesel Car</option>
                  <option value="electric_two_wheeler">Electric Two-Wheeler (Scooter/Bike)</option>
                  <option value="petrol_two_wheeler">Petrol Two-Wheeler</option>
                  <option value="electric_three_wheeler">Electric Three-Wheeler (Auto/Cargo)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Make & Model */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Manufacturer / Make</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Tata Motors / MG / Ather"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Nexon EV / 450X"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              {/* Registration Plate */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Registration Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. KA-01-EQ-1234"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* EV-Specific Specifications */}
              {isElectricCapable && (
                <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                    <Zap className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                    <span>EV Inlets & Charging Limits</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      Supported Connectors (Select all compatible)
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_CONNECTORS.map((connector) => {
                        const isSelected = selectedConnectors.includes(connector);
                        return (
                          <button
                            type="button"
                            key={connector}
                            onClick={() => toggleConnector(connector)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                            <span>{CONNECTOR_TYPE_LABELS[connector] || connector}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Max AC Power (kW)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="43"
                        value={maxAcPowerKw}
                        onChange={(e) => setMaxAcPowerKw(e.target.value)}
                        placeholder="e.g. 7.4"
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Max DC Power (kW)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        max="350"
                        value={maxDcPowerKw}
                        onChange={(e) => setMaxDcPowerKw(e.target.value)}
                        placeholder="e.g. 50"
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 leading-relaxed flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Actual charging speed is bounded by your vehicle's max kW limit.</span>
                  </p>
                </div>
              )}

              {/* Set Default Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultVehicle"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="defaultVehicle" className="text-xs text-slate-700 font-medium select-none">
                  Set as my default vehicle for instant reservations
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'Saving...' : editingVehicleId ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
