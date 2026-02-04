import React from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const ActivityLogDrawer = ({ open, setOpen, log }) => {
  if (!log) return null;

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                          Log Details
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative flex-1 px-4 py-6 sm:px-6">
                      
                      <div className='mb-6 space-y-2'>
                          <div className='grid grid-cols-2 gap-4 text-sm'>
                             <div>
                                <span className='block text-gray-500'>Action</span>
                                <span className='font-medium text-gray-900'>{log.action}</span>
                             </div>
                             <div>
                                <span className='block text-gray-500'>Status</span>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    log.status === 'SUCCESS' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-red-50 text-red-700 ring-red-600/20'
                                }`}>
                                    {log.status}
                                </span>
                             </div>
                             <div>
                                <span className='block text-gray-500'>Severity</span>
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                    log.severity === 'CRITICAL' ? 'bg-red-50 text-red-700 ring-red-600/20' : 
                                    log.severity === 'WARN' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : 
                                    'bg-blue-50 text-blue-700 ring-blue-700/10'
                                }`}>
                                    {log.severity}
                                </span>
                             </div>
                             <div>
                                <span className='block text-gray-500'>User</span>
                                <span className='font-medium text-gray-900'>{log.userEmail || 'N/A'}</span>
                             </div>
                             <div className='col-span-2'>
                                <span className='block text-gray-500'>Timestamp</span>
                                <span className='font-medium text-gray-900'>{new Date(log.timestamp).toLocaleString()}</span>
                             </div>
                              <div className='col-span-2'>
                                <span className='block text-gray-500'>Request ID</span>
                                <span className='font-mono text-xs text-gray-600 break-all'>{log.requestId}</span>
                             </div>
                          </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Request Context</h4>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                           <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">IP Address</dt>
                            <dd className="mt-1 text-sm text-gray-900">{log.ip}</dd>
                          </div>
                           <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500">Method</dt>
                            <dd className="mt-1 text-sm text-gray-900">{log.method}</dd>
                          </div>
                           <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Endpoint</dt>
                            <dd className="mt-1 text-sm text-gray-900 break-all">{log.endpoint}</dd>
                          </div>
                           <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">User Agent</dt>
                            <dd className="mt-1 text-xs text-gray-900 break-all">{log.userAgent}</dd>
                          </div>
                        </dl>
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Metadata</h4>
                            <div className="rounded-md bg-gray-50 p-4 overflow-x-auto">
                                <pre className="text-xs text-gray-800 font-mono">
                                    {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                            </div>
                        </div>
                      )}

                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ActivityLogDrawer;
