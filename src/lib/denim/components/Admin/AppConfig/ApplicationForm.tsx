// import React, { useState, createRef } from "react";
// import {
//   Stack,
//   Separator,
//   Icon,
//   IconButton,
//   Label,
//   PrimaryButton,
//   // useMutation,
//   // useQuery,
//   IndexableObject, 
// } from "../lib";
// import { Form } from "../../../../typical-admin-fabric/lib";

// import { applicationSchema, roleSchema, linkSchema } from "../schema";
// import {  } from "../lib";
// import dispatcher, {
//   IRole,
//   ILink,
//   IGroup,
//   IListGroups
// } from "../../../lib/queries";
// import Alert from "./Alert";
// interface Props {
//   application: any;
// }

// export const ApplicationForm: React.FC<Props> = ({ application }) => {
//   const { data } = useQuery<IListGroups>(dispatcher.listGroups);
//   const groups = data?.getGroups || [];
//   const [app, setApp] = useState(application);
//   const [message, setMessage] = useState<string | undefined>();
//   const appForm: React.RefObject<any> = createRef();
//   const [roles, setRoles] = useState(app.roles.map(() => createRef()));
//   const [links, setLinks] = useState(app.links.map(() => createRef()));
//   const [updateApplication] = useMutation(dispatcher.updateApplication, {
//     onCompleted: data =>
//       setMessage(
//         `Application ${data.updateApplication.name} updated successfully`
//       )
//   });
//   const [addApplication] = useMutation(dispatcher.addApplication, {
//     onCompleted: data => {
//       setMessage(
//         `Application ${data.addApplication.name} updated successfully`
//       );
//       setApp(data.addApplication.id);
//     }
//   });

//   function handleSubmit() {
//     application.id === "new"
//       ? addApplication({
//           variables: {
//             application: submit()
//           },
//           refetchQueries: ["getApplications", "my"]
//         })
//       : updateApplication({
//           variables: {
//             id: application.id,
//             application: submit()
//           },
//           refetchQueries: ["getApplications", "my"]
//         });
//   }

//   function submit() {
//     return {
//       ...(appForm.current && appForm.current.submit()),
//       roles: roles.map(
//         (r: React.RefObject<any>) => r && r.current && r.current.submit()
//       ),
//       links: links.map(
//         (r: React.RefObject<any>) => r && r.current && r.current.submit()
//       )
//     };
//   }
//   function addLink() {
//     setApp({ ...app, links: [...app.links, {}] });
//     setLinks([...links, React.createRef()]);
//   }
//   function addRole() {
//     setApp({ ...app, roles: [...app.roles, {}] });
//     setRoles([...roles, React.createRef()]);
//   }
//   function removeRole(e: any) {
//     const target: IndexableObject = e.currentTarget;
//     setApp({
//       ...app,
//       roles: app.roles.filter(
//         (_: IRole, i: number) => `role.${i}` !== target.name
//       )
//     });
//     setRoles(
//       roles.filter(
//         (_: React.RefObject<any>, i: number) => `role.${i}` !== target.name
//       )
//     );
//   }
//   function removeLink(e: any) {
//     const target: IndexableObject = e.currentTarget;
//     setApp({
//       ...app,
//       links: app.links.filter((r: ILink) => r.path !== target.name)
//     });
//     setLinks(
//       links.filter(
//         (_: React.RefObject<any>, i: number) =>
//           i !== app.links.findIndex((l: ILink) => l.path !== target.name)
//       )
//     );
//   }
//   function handleRoleChange() {
//     setApp(submit());
//   }
//   function closeAlert() {
//     setMessage(undefined);
//   }
//   return (
//     <>
//       {message && <Alert close={closeAlert} message={message} />}
//       <Stack style={{ maxWidth: "38.5em" }}>
//         <Form
//           ref={appForm}
//           name={"application"}
//           initialValues={app}
//           form={applicationSchema}
//         />
//       </Stack>
//       <Stack
//         style={{ paddingTop: "0.77em" }}
//         wrap
//         horizontal
//         horizontalAlign={"space-between"}
//       >
//         <Label>Roles</Label>
//         <IconButton onClick={addRole}>
//           <Icon iconName={"Add"}></Icon>
//         </IconButton>
//       </Stack>
//       <Separator />
//       <Stack wrap horizontal>
//         {app.roles.map((r: IRole, i: number) => {
//           return (
//             <Stack style={{ padding: "0.77em", minWidth: "21.5em" }} key={i}>
//               <Stack.Item align={"end"}>
//                 <IconButton name={`role.${i}`} onClick={removeRole}>
//                   <Icon iconName={"Remove"} />
//                 </IconButton>
//               </Stack.Item>
//               <Form
//                 ref={roles[i]}
//                 form={roleSchema(
//                   groups.map((g: IGroup) => ({
//                     text: g.name,
//                     value: g.name
//                   })) || []
//                 )}
//                 name={`role.${i}`}
//                 initialValues={r}
//                 onChange={handleRoleChange}
//               />
//             </Stack>
//           );
//         })}
//       </Stack>
//       <Stack
//         style={{ paddingTop: "0.77em" }}
//         wrap
//         horizontal
//         horizontalAlign={"space-between"}
//       >
//         <Label>Links</Label>
//         <IconButton onClick={addLink}>
//           <Icon iconName={"Add"}></Icon>
//         </IconButton>
//       </Stack>
//       <Separator />
//       <Stack wrap horizontal>
//         {app.links.map((l: ILink, i: number) => {
//           return (
//             <Stack style={{ padding: "0.77em", minWidth: "21.5em" }} key={i}>
//               <Stack.Item align={"end"}>
//                 <IconButton
//                   name={
//                     links[i] && links[i].current && links[i].current.values.path
//                   }
//                   onClick={removeLink}
//                 >
//                   <Icon iconName={"Remove"} />
//                 </IconButton>
//               </Stack.Item>
//               <Form
//                 ref={links[i]}
//                 form={linkSchema(
//                   roles.map((r: React.RefObject<any>) => {
//                     return r && r.current
//                       ? {
//                           text: r.current.submit().name,
//                           value: r.current.submit().name
//                         }
//                       : {};
//                   })
//                 )}
//                 name={`link.${i}`}
//                 initialValues={l}
//               />
//             </Stack>
//           );
//         })}
//       </Stack>
//       <Separator />
//       <Stack horizontalAlign={"end"}>
//         <PrimaryButton onClick={handleSubmit}>
//           {application.id === "new" ? "Add" : "Update"}
//         </PrimaryButton>
//       </Stack>
//     </>
//   );
// };
