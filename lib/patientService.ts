export const patientService = {
  async getPatients(page = 1, limit = 25) {
    const response = await fetch(process.env.NOCODB_BASE_URL+`/api/v2/tables/mxusip10ck64oiu/records?page=${page}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch patients');
    return response.json();
  },

  async getPatient(id: string) {
    const response = await fetch(process.env.NOCODB_BASE_URL+`/api/v2/tables/mxusip10ck64oiu/records/${id}`);
    if (!response.ok) throw new Error('Failed to fetch patient');
    return response.json();
  },

  async createPatient(data: any) {
    const response = await fetch(process.env.NOCODB_BASE_URL+'/api/v2/tables/mxusip10ck64oiu/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create patient');
    return response.json();
  },

  async updatePatient(data: any) {
    const response = await fetch(process.env.NOCODB_BASE_URL+'/api/v2/tables/mxusip10ck64oiu/records', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update patient');
    return response.json();
  },

  async deletePatient(id: string) {
    const response = await fetch(process.env.NOCODB_BASE_URL+'/api/v2/tables/mxusip10ck64oiu/records', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!response.ok) throw new Error('Failed to delete patient');
    return response.json();
  },

  async getLinkedRecords(linkFieldId: string, recordId: string) {
    const response = await fetch(`/api/v2/tables/mxusip10ck64oiu/records/links?linkFieldId=${linkFieldId}&recordId=${recordId}`);
    if (!response.ok) throw new Error('Failed to fetch linked records');
    return response.json();
  },

  async linkRecords(linkFieldId: string, recordId: string, data: any) {
    const response = await fetch('/api/v2/tables/mxusip10ck64oiu/records/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkFieldId, recordId, body: data }),
    });
    if (!response.ok) throw new Error('Failed to link records');
    return response.json();
  },

  async unlinkRecords(linkFieldId: string, recordId: string) {
    const response = await fetch('/api/v2/tables/mxusip10ck64oiu/records/links', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ linkFieldId, recordId }),
    });
    if (!response.ok) throw new Error('Failed to unlink records');
    return response.json();
  },
};