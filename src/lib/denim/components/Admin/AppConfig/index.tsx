// import React, { useState } from 'react';
// import {
//   Stack,
//   Separator,
//   useQuery,
//   Dropdown,
//   IndexableObject,
//   IconButton,
//   Icon,
//   Label,
//   getStyle,
// } from '../lib';
// import dispatcher, {
//   IListApplications,
//   IApplication,
// } from '../../../lib/queries';
// import { IDropdownOption } from 'office-ui-fabric-react';
// import { ApplicationForm } from './ApplicationForm';

// interface Props {}

// const Index: React.FC<Props> = () => {
//   const { data } = useQuery<IListApplications>(dispatcher.listApplications);
//   const [application, setApplication] = useState<Partial<IApplication>>({});
//   const style = getStyle();
//   function handleAddApplication() {
//     setApplication({
//       id: 'new',
//       roles: [{ groupNames: [] }],
//       links: [{ roles: [] }],
//     } as IndexableObject);
//   }
//   function handleSelectApplication(
//     _: React.FormEvent<HTMLDivElement>,
//     option?: IDropdownOption | undefined
//   ) {
//     const o: IndexableObject = option || {};
//     const app: IndexableObject =
//       (data && data.getApplications.find(a => a && a.path === o.key)) || {};
//     setApplication(app);
//   }
//   return (
//     <Stack>
//       <h3>Application Configuration</h3>
//       <Stack
//         wrap
//         horizontal
//         horizontalAlign={'space-between'}
//         verticalAlign={'center'}
//       >
//         <Stack horizontal verticalAlign={'center'}>
//           <Label className={style.labelHorizontal}>Application</Label>
//           <Dropdown
//             className={style.fieldHorizontal}
//             placeholder={'Select an application'}
//             options={
//               (data &&
//                 data.getApplications &&
//                 data.getApplications
//                   .map(app => ({
//                     key: (app.path && app.path) || '',
//                     text: (app.name && app.name) || '',
//                   }))
//                   .sort((a, b) =>
//                     a.text.toLowerCase() > b.text.toLowerCase() ? 1 : -1
//                   )) || [{ key: '', text: 'Loading...' }]
//             }
//             onChange={handleSelectApplication}
//           />
//         </Stack>
//         <IconButton onClick={handleAddApplication}>
//           <Icon iconName={'Add'}></Icon>
//         </IconButton>
//       </Stack>
//       <Separator />
//       {Object.keys(application).length > 0 && (
//         <ApplicationForm key={application.id} application={application} />
//       )}
//     </Stack>
//   );
// };
// export default Index;
