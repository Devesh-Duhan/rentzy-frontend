import axios from '@/lib/axios';

export const fetchSettings = async () => {
    const res = await axios.get('/settings');
    return res.data;
};

export const saveSettings = async (data) => {
    const res = await axios.post('/settings', data);
    return res.data;
};
