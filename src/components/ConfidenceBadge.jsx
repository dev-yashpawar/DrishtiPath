import {useLanguage} from '../context';
export default function ConfidenceBadge({confidence}){const {t}=useLanguage();return <div className={`confidence ${confidence<.65?'low':''}`}><strong>{Math.round(confidence*100)}<small>%</small></strong><span className="mono">{t('CONFIDENCE','विश्वास स्तर')}</span></div>;}
