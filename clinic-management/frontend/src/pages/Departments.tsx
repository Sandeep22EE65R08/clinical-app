import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { Department, DepartmentReportRow, DoctorProfile, Facility } from '../types';
import {
  assignDoctors, createDepartment, createFacility, deleteDepartment, deleteFacility,
  getDepartmentReport, getDepartments, getDoctorProfiles, getFacilities, saveDoctorProfile,
} from '../api/endpoints';
import { rupee } from '../utils';

export default function Departments() {
  const [depts, setDepts] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [report, setReport] = useState<DepartmentReportRow[]>([]);
  const [msg, setMsg] = useState('');
  const [nd, setNd] = useState({ name: '', description: '', facilityId: '' });
  const [nf, setNf] = useState({ name: '', address: '', phone: '' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = useCallback(() => {
    getDepartments().then(setDepts).catch(() => {});
    getDoctorProfiles().then(setDoctors).catch(() => {});
    getFacilities().then(setFacilities).catch(() => {});
    getDepartmentReport({}).then(setReport).catch(() => {});
  }, []);
  useEffect(load, [load]);

  const fail = (e: unknown, fallback: string) =>
    setMsg(isAxiosError(e) && e.response?.data?.message ? e.response.data.message : fallback);

  const addDept = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    try {
      await createDepartment({ name: nd.name, description: nd.description || null, facilityId: nd.facilityId || null });
      setNd({ name: '', description: '', facilityId: '' }); load();
    } catch (err) { fail(err, 'Could not add department.'); }
  };
  const addFacility = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    try { await createFacility({ ...nf, phone: nf.phone || null }); setNf({ name: '', address: '', phone: '' }); load(); }
    catch (err) { fail(err, 'Could not add branch.'); }
  };
  const toggleDoctor = async (d: Department, id: string) => {
    const ids = d.doctorIds.includes(id) ? d.doctorIds.filter((x) => x !== id) : [...d.doctorIds, id];
    await assignDoctors(d.id, ids); load();
  };
  const saveProfile = async (p: DoctorProfile, f: FormData) => {
    await saveDoctorProfile(p.userId, {
      qualifications: f.get('q') || null, councilRegistrationNumber: f.get('reg') || null,
      councilName: f.get('council') || null, experienceYears: Number(f.get('exp')) || 0, bio: null,
    });
    setEditing(null); load();
  };

  return (
    <div>
      <h1 className="page-title">Departments &amp; Doctors</h1>
      {msg && <div className="error">{msg}</div>}

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Department-wise report (this month)</h3>
        {report.length === 0 ? <p className="muted">Add departments and assign doctors to see this report.</p> : (
          <table className="table"><thead><tr><th>Department</th><th>Doctors</th><th>Patients</th><th>Collection</th><th>Pending</th></tr></thead>
            <tbody>{report.map((r) => (
              <tr key={r.departmentId ?? 'none'}><td>{r.department}</td><td>{r.doctors}</td><td>{r.visits}</td>
                <td>{rupee(r.collection)}</td><td>{rupee(r.pending)}</td></tr>))}</tbody></table>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Departments</h3>
        {depts.map((d) => (
          <div key={d.id} style={{ borderTop: '1px dashed var(--border)', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <b>{d.name} <span className="muted">· {d.doctorCount} doctor(s)</span></b>
              <button className="btn" onClick={() => deleteDepartment(d.id).then(load)}>Delete</button>
            </div>
            <div className="chip-row">
              {doctors.map((doc) => (
                <button type="button" key={doc.userId} onClick={() => toggleDoctor(d, doc.userId)}
                  className={`chip${d.doctorIds.includes(doc.userId) ? ' chip-on' : ''}`}>{doc.name}</button>))}
              {doctors.length === 0 && <span className="muted">Add doctors under Staff first.</span>}
            </div>
          </div>))}
        <form onSubmit={addDept} className="row" style={{ marginTop: 12 }}>
          <div className="field"><label>New department</label>
            <input className="input" required value={nd.name} placeholder="e.g. Cardiology"
              onChange={(e) => setNd({ ...nd, name: e.target.value })} /></div>
          <div className="field"><label>Branch (optional)</label>
            <select value={nd.facilityId} onChange={(e) => setNd({ ...nd, facilityId: e.target.value })}>
              <option value="">All / main</option>
              {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></div>
          <button className="btn btn-primary" style={{ alignSelf: 'end' }}>Add Department</button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3 style={{ marginTop: 0 }}>Doctor profiles</h3>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
          “Verified” is only given after an independent credential check. Editing details here does not verify a doctor.
        </p>
        {doctors.map((p) => (
          <div key={p.userId} style={{ borderTop: '1px dashed var(--border)', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <span><b>{p.name}</b> <span className="muted">{p.specialization} · {p.qualifications || 'no qualifications added'}
                {p.councilRegistrationNumber ? ` · Reg. ${p.councilRegistrationNumber}` : ''} · {p.experienceYears} yrs</span></span>
              <span><span className="muted">{p.verificationStatus}</span>{' '}
                <button className="btn" onClick={() => setEditing(editing === p.userId ? null : p.userId)}>Edit</button></span>
            </div>
            {editing === p.userId && (
              <form className="row" style={{ marginTop: 8 }}
                onSubmit={(e) => { e.preventDefault(); saveProfile(p, new FormData(e.currentTarget)); }}>
                <div className="field"><label>Qualifications</label>
                  <input className="input" name="q" defaultValue={p.qualifications ?? ''} placeholder="MBBS, MD" /></div>
                <div className="field"><label>Council registration no.</label>
                  <input className="input" name="reg" defaultValue={p.councilRegistrationNumber ?? ''} /></div>
                <div className="field"><label>Medical council</label>
                  <input className="input" name="council" defaultValue={p.councilName ?? ''} placeholder="Bihar Medical Council" /></div>
                <div className="field"><label>Experience (years)</label>
                  <input className="input" name="exp" inputMode="numeric" defaultValue={p.experienceYears} /></div>
                <button className="btn btn-primary" style={{ alignSelf: 'end' }}>Save</button>
              </form>)}
          </div>))}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Branches</h3>
        {facilities.map((f) => (
          <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
            <span><b>{f.name}</b> <span className="muted">{f.address}</span></span>
            <button className="btn" onClick={() => deleteFacility(f.id).then(load)}>Delete</button>
          </div>))}
        <form onSubmit={addFacility} className="row" style={{ marginTop: 8 }}>
          <div className="field"><label>Branch name</label>
            <input className="input" required value={nf.name} onChange={(e) => setNf({ ...nf, name: e.target.value })} /></div>
          <div className="field"><label>Address</label>
            <input className="input" required value={nf.address} onChange={(e) => setNf({ ...nf, address: e.target.value })} /></div>
          <button className="btn btn-primary" style={{ alignSelf: 'end' }}>Add Branch</button>
        </form>
      </div>
    </div>
  );
}
