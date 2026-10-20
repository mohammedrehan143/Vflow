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
      if (res.success && res.vehicles) {
        setVehicles(res.vehicles);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch registered vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 bg-white min-h-screen text-neutral-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
            <Car className="w-4 h-4 stroke-[2.5]" />
            <span>Vehicle Specifications</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight">
            My Vehicles & Compatibility
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium">
            Manage your vehicles to automatically filter compatible EV chargers and parking spaces.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2.5 rounded-xl shadow-xs text-xs transition active:scale-95 border border-yellow-500/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicle List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-neutral-100 rounded-3xl animate-pulse border border-neutral-200" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-neutral-300 p-10 text-center space-y-4">
          <div className="w-14 h-14 bg-yellow-100 text-black rounded-2xl flex items-center justify-center mx-auto border border-yellow-300">
            <BatteryCharging className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-neutral-900">No Vehicles Registered Yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto font-medium">
              Add your EV or combustion vehicle to receive personalized compatibility checks and seamless parking bookings.
            </p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-black px-4 py-2.5 rounded-xl text-xs shadow-xs active:scale-95 border border-yellow-500/20"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
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
                className={`bg-white rounded-3xl border-2 p-5 sm:p-6 space-y-4 transition hover:shadow-md relative ${
                  v.isDefault ? 'border-yellow-400 shadow-xs' : 'border-neutral-200 shadow-xs'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                        isEv ? 'bg-yellow-400 text-black font-black' : 'bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      {isEv ? <Zap className="w-5 h-5 fill-current stroke-current" /> : <Fuel className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-neutral-900">
                          {v.manufacturer} {v.model}
                        </h3>
                        {v.isDefault && (
                          <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1 shadow-xs">
                            <Star className="w-3 h-3 fill-black" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 font-medium">
                        {VEHICLE_TYPE_LABELS[v.vehicleType] || v.vehicleType} •{' '}
                        {POWERTRAIN_LABELS[v.powertrain] || v.powertrain}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition"
                      title="Edit Vehicle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v._id)}
                      className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Specs Pill List */}
                <div className="bg-neutral-50 rounded-2xl p-3.5 space-y-2 border border-neutral-200 text-xs">
                  {v.registrationNumber && (
                    <div className="flex justify-between items-center text-neutral-600">
                      <span className="text-[11px] text-neutral-500 uppercase font-black">Plate / Reg</span>
                      <span className="font-mono font-black text-neutral-900 bg-white px-2 py-0.5 rounded-lg border border-neutral-200">
                        {v.registrationNumber}
                      </span>
                    </div>
                  )}

                  {isEv && (
                    <>
                      <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[11px] text-neutral-500 uppercase font-black">Supported Inlets</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {v.supportedConnectorTypes && v.supportedConnectorTypes.length > 0 ? (
                            v.supportedConnectorTypes.map((c) => (
                              <span
                                key={c}
                                className="bg-yellow-100 text-black border border-yellow-300 text-[10px] font-black px-2 py-0.5 rounded-md"
                              >
                                {CONNECTOR_TYPE_LABELS[c as ConnectorType] || c}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-400">None specified</span>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-neutral-600">
                        <span className="text-[11px] text-neutral-500 uppercase font-black">Max Power Intake</span>
                        <div className="flex gap-2 text-[11px] font-black text-neutral-900">
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
                      className="text-xs font-black text-neutral-700 hover:text-black flex items-center gap-1.5 transition"
                    >
                      <Star className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Set as Default Vehicle</span>
                    </button>
                  ) : (
                    <span className="text-xs text-black font-black flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 stroke-[3] text-yellow-500" /> Used by default for instant booking
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
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl relative border-2 border-neutral-900 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-neutral-900">
                {editingVehicleId ? 'Edit Vehicle Specifications' : 'Add New Customer Vehicle'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium">
                Accurate vehicle specs ensure verified charger matching and avoid booking incompatible spots.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle Type */}
              <div>
                <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">Vehicle Category</label>
                <select
                  value={vehicleType}
                  onChange={(e) => handleVehicleTypeChange(e.target.value as CustomerVehicleType)}
                  className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-bold focus:outline-none focus:border-black"
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
                  <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">Manufacturer / Make</label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g. Tata / MG / Ather"
                    className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-bold focus:outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">Model Name</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Nexon EV / 450X"
                    className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-bold focus:outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              {/* Registration Plate */}
              <div>
                <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">
                  Registration Number <span className="text-neutral-400 font-medium lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  placeholder="e.g. KA-01-EQ-1234"
                  className="w-full text-xs p-3 rounded-xl bg-neutral-50 border border-neutral-300 font-bold uppercase focus:outline-none focus:border-black"
                />
              </div>

              {/* EV-Specific Specifications */}
              {isElectricCapable && (
                <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-300 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-black text-neutral-900">
                    <Zap className="w-4 h-4 fill-black stroke-black" />
                    <span>EV Inlets & Charging Limits</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-neutral-700 mb-1.5">
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
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 ${
                              isSelected
                                ? 'bg-black text-yellow-400 border border-black shadow-xs'
                                : 'bg-white border border-neutral-300 text-neutral-700 hover:text-black'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{CONNECTOR_TYPE_LABELS[connector] || connector}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">
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
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-neutral-700 uppercase mb-1">
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
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-neutral-300 font-bold focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-neutral-700 leading-relaxed flex items-center gap-1 font-medium">
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
                  className="rounded border-neutral-300 accent-black cursor-pointer w-4 h-4"
                />
                <label htmlFor="defaultVehicle" className="text-xs text-neutral-700 font-bold select-none cursor-pointer">
                  Set as my default vehicle for instant reservations
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:text-black hover:bg-neutral-50 text-xs font-black transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black transition shadow-xs active:scale-95 border border-yellow-500/20"
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
