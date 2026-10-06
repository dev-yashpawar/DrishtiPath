import {Link} from 'react-router-dom';
export default function Button({to,children,secondary=false,className='',...props}){const cls=`button ${secondary?'secondary':''} ${className}`;return to?<Link to={to} className={cls} {...props}>{children}</Link>:<button className={cls} {...props}>{children}</button>;}
