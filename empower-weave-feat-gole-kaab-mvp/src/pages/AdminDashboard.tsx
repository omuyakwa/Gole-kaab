import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{t('adminDashboard.title')}</h1>
      <p>{t('adminDashboard.description')}</p>
    </div>
  );
};

export default AdminDashboard;
