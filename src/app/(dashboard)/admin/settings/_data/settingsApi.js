import axios from '@/lib/axios';

export const fetchSettings = async () => {
    // Admin screens need the full settings document - the public /settings
    // endpoint intentionally strips SEO/script fields.
    const res = await axios.get('/settings/admin');
    return res.data;
};

export const saveSettings = async (data) => {
    const res = await axios.post('/settings', data);
    return res.data;
};
