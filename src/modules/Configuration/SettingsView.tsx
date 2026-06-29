// import { Controller, useFieldArray, useForm } from 'react-hook-form';
// import { motion } from 'framer-motion';
// import { isObjectEmpty } from '>/services/utils';
// import { PrimeObject, CollectionRow } from '>/types';
// import { useDialogStore, useTablesDataStore } from '>/services/stores';
// import { useSettingsMutation } from '>/services/queryHooks/useWriteHooks';

// import {
//   FormTextField,
//   FormNumberField,
//   FormCheckboxField,
//   FormSwitchField,
//   DialogRenderer,
//   ScreenLoader,
// } from '>/modules';

// type SidebarItemSetting = {
//   id: string;
//   name: string;
//   enabled: boolean;
// };

// type SettingsForm = {
//   sidebarItems: SidebarItemSetting[];
// };

// const defaultItems: SidebarItemSetting[] = [
//   { id: 'dbView', name: 'Databases', enabled: true },
//   { id: 'tableView', name: 'Tables', enabled: true },
//   { id: 'queryView', name: 'Queries', enabled: true },
//   { id: 'usersView', name: 'Users', enabled: false },
// ];

// export const SettingsView = () => {
//   const form = useForm<SettingsForm>({
//     defaultValues: { sidebarItems: defaultItems },
//   });

//   const { fields, move } = useFieldArray({
//     control: form.control,
//     name: 'sidebarItems',
//   });

//   const { mutate: saveSettings, isPending } = useSettingsMutation(
//     ({ api, query, state }) => ({
//       mutate: api.mutate,
//       isPending: query.isPending,
//     }),
//   );

//   const onSubmit = (data: SettingsForm) => {
//     saveSettings({
//       preferences: {
//         sidebarItems: data.sidebarItems,
//       },
//     });
//   };

//   const submit = form.handleSubmit(onSubmit);

//   return (
//     <>
//       {/* Headings */}
//       <h1 className='text-3xl font-bold'>Settings</h1>
//       <h2 className='text-2xl font-semibold mt-4'>Left Navigation</h2>

//       {/* Table */}
//       <div className='overflow-x-auto mt-6'>
//         <table className='min-w-full table-auto'>
//           <thead>
//             <tr className='bg-gray-100'>
//               <th className='px-4 py-2 text-left'>Active</th>
//               <th className='px-4 py-2 text-left'>Name</th>
//               <th className='px-4 py-2 text-left'>Sort Order</th>
//             </tr>
//           </thead>
//           <motion.tbody layout>
//             {fields.map((field, idx) => {
//               const checkboxId = `sidebarItems.${idx}.enabled` as const;
//               return (
//                 <motion.tr
//                   key={field.id}
//                   layout
//                   transition={{ type: 'spring', stiffness: 300, damping: 30 }}
//                   className={`${
//                     idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
//                   } hover:bg-gray-200 cursor-pointer`}
//                   onClick={() =>
//                     form.setValue(checkboxId, !form.getValues(checkboxId))
//                   }
//                 >
//                   <td className='px-4 py-2 text-center align-middle'>
//                     <div className='flex justify-center items-center'>
//                       <FormSwitchField
//                         name={checkboxId}
//                         control={form.control}
//                       />
//                     </div>
//                   </td>
//                   <td className='px-4 py-2'>{field.name}</td>
//                   <td className='px-4 py-2'>
//                     <div className='flex justify-center space-x-2'>
//                       <button
//                         className='p-2 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300'
//                         disabled={idx === 0}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           move(idx, idx - 1);
//                         }}
//                       >
//                         ▲
//                       </button>
//                       <button
//                         className='p-2 text-sm bg-blue-500 text-white rounded disabled:bg-gray-300'
//                         disabled={idx === fields.length - 1}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           move(idx, idx + 1);
//                         }}
//                       >
//                         ▼
//                       </button>
//                     </div>
//                   </td>
//                 </motion.tr>
//               );
//             })}
//           </motion.tbody>
//         </table>
//       </div>

//       {/* Button Group */}
//       <div className='flex space-x-4 mt-6'>
//         <button
//           className='px-6 py-2 bg-gray-300 text-gray-700 rounded-lg'
//           onClick={() => form.reset()}
//         >
//           Reset
//         </button>
//         <button
//           className='px-6 py-2 bg-blue-500 text-white rounded-lg'
//           onClick={submit}
//         >
//           Save
//         </button>
//       </div>
//     </>
//   );
// };
