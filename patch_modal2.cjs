const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Insert the modal at the end of the App component (before the last </div>)
const modalJSX = `
      {/* View Survey Modal */}
      {viewingSurvey && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h2 className="font-bold text-slate-800">Survey Preview</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => window.print()} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button onClick={() => setViewingSurvey(null)} className="text-slate-500 hover:text-slate-800 p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 overflow-y-auto bg-gray-100 flex justify-center print:p-0 print:bg-white">
              {/* PDF Container */}
              <div className="bg-white w-[794px] min-h-[1123px] shadow-sm border border-slate-200 print:border-none print:shadow-none print:w-full print:min-h-0 text-[12px]">
                {/* Header Red Bar */}
                <div className="bg-[#ff9999] text-center font-bold py-1 border-b border-red-500 text-[11px]">
                  PAN No.: AKMPV0774C
                </div>
                
                {/* Logo & Address */}
                <div className="flex border-b border-red-500 h-24">
                  <div className="w-1/3 border-r border-red-500 flex items-center justify-center p-4">
                    <div className="text-blue-800 font-extrabold text-4xl italic tracking-tighter relative">
                      UPL
                      <div className="absolute top-1/2 -right-4 -translate-y-1/2 text-blue-900">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="w-2/3 p-2 text-center flex flex-col justify-center">
                    <h1 className="text-xl font-bold font-serif mb-1">UrbanPro Pracker & Logistics</h1>
                    <p className="text-[10px]"><strong>Address:</strong> Plot No 1491, Balintha Canal Road, Near Lenskart, Hanspal, Bhubaneswar, Odisha -752101</p>
                    <p className="text-[10px]"><strong>Mobile No.:</strong> 8093017400</p>
                    <p className="text-[10px]"><strong>Email:</strong> urbanpro403@gmail.com</p>
                  </div>
                </div>

                {/* Survey List Title */}
                <div className="bg-[#ff9999] text-center font-bold py-1 border-b border-red-500 text-[12px]">
                  Survey List
                </div>

                {/* Patient / Party Info */}
                <div className="p-4 border-b border-red-500 text-[11px] space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex-1 flex items-baseline">
                      <span className="mr-2">Name:</span>
                      <span className="flex-1 border-b border-black font-semibold min-h-[16px] inline-block">{viewingSurvey.partyName}</span>
                    </div>
                    <div className="w-48 flex items-baseline ml-8">
                      <span className="mr-2">Survey No.</span>
                      <span className="flex-1 border-b border-black font-semibold text-center inline-block">{viewingSurvey.surveyNo || viewingSurvey.id}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 items-end justify-between">
                    <div className="flex items-baseline w-[25%]">
                      <span className="mr-2">Mobile:</span>
                      <span className="flex-1 border-b border-black font-semibold inline-block">{viewingSurvey.mobileNo}</span>
                    </div>
                    <div className="flex items-baseline w-[25%]">
                      <span className="mr-2">Move From:</span>
                      <span className="flex-1 border-b border-black font-semibold inline-block">{viewingSurvey.fromCity}</span>
                    </div>
                    <div className="flex items-baseline w-[25%]">
                      <span className="mr-2">Move To:</span>
                      <span className="flex-1 border-b border-black font-semibold inline-block">{viewingSurvey.toCity}</span>
                    </div>
                    <div className="flex items-baseline w-[25%]">
                      <span className="mr-2 whitespace-nowrap">Survey Date:</span>
                      <span className="flex-1 border-b border-black font-semibold text-center inline-block">{viewingSurvey.surveyDate}</span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="w-full">
                  <div className="flex bg-[#ff9999] font-bold text-[10px] text-center border-b border-red-500 py-1">
                    <div className="w-12 border-r border-red-500">Sr.</div>
                    <div className="flex-1 border-r border-red-500">Item Name</div>
                    <div className="w-24 border-r border-red-500">Quantity</div>
                    <div className="w-32 border-r border-red-500">Value (in Rs.)</div>
                    <div className="w-48">Remark</div>
                  </div>
                  
                  {viewingSurvey.items && viewingSurvey.items.length > 0 ? viewingSurvey.items.map((item, idx) => (
                    <div key={idx} className="flex text-[11px] text-center border-b border-red-500 py-1">
                      <div className="w-12 border-r border-red-500">{idx + 1}</div>
                      <div className="flex-1 border-r border-red-500 text-left px-2">{item.name}</div>
                      <div className="w-24 border-r border-red-500">{item.qty}</div>
                      <div className="w-32 border-r border-red-500">{item.value || '0'}</div>
                      <div className="w-48 px-2 text-left">{item.remark}</div>
                    </div>
                  )) : (
                    <div className="flex text-[11px] text-center border-b border-red-500 py-1 min-h-[24px]">
                      <div className="w-12 border-r border-red-500"></div>
                      <div className="flex-1 border-r border-red-500"></div>
                      <div className="w-24 border-r border-red-500"></div>
                      <div className="w-32 border-r border-red-500"></div>
                      <div className="w-48"></div>
                    </div>
                  )}
                  
                  {/* Total Row */}
                  <div className="flex text-[11px] font-bold border-b border-red-500 py-1 text-center bg-[#ffcccc]">
                    <div className="flex-1 border-r border-red-500 text-right pr-4"></div>
                    <div className="w-24 border-r border-red-500 bg-[#ff9999] py-0.5">Total: {viewingSurvey.items?.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0) || 0}</div>
                    <div className="w-32 bg-[#ff9999] border-r border-red-500 py-0.5">Value: {viewingSurvey.items?.reduce((acc, curr) => acc + (parseFloat(curr.value) || 0), 0) || 0}</div>
                    <div className="w-48"></div>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="flex border-b border-red-500 h-32">
                  <div className="w-1/2 border-r border-red-500 p-2 flex flex-col items-center justify-between text-blue-600 font-bold text-[11px]">
                    <div>For UrbanPro Pracker & Logistics</div>
                    <div className="w-16 h-12 border border-blue-200 rounded flex items-center justify-center opacity-50 mt-2">
                      <span className="italic text-xs font-serif transform -rotate-12">VIJAY</span>
                    </div>
                    <div>Authorized Signature</div>
                  </div>
                  <div className="w-1/2 p-2 text-center">
                    <div className="text-[10px] font-semibold mt-4">Agree with Terms & Conditions as Overleaf Signature Receiver's</div>
                  </div>
                </div>

                {/* Disclaimer / Note */}
                <div className="p-2 border-b border-red-500 bg-[#ffcccc] text-[9px] leading-tight">
                  <span className="font-semibold text-red-900">We have verified and confirmed all items listed as 01-{viewingSurvey.items?.length || 0}, with a total count of {viewingSurvey.items?.reduce((acc, curr) => acc + (parseInt(curr.qty) || 0), 0) || 0}. This represents a true and comprehensive inventory of the presented goods, acknowledging that their condition may vary.</span>
                </div>
                
                <div className="p-2 border-b border-red-500 text-[9px] text-red-700 leading-tight">
                  <strong>Note:</strong> Please keep your Cash/Jewellery and other valuable items in your Custody/Lock. Carrying Liquor, Gas Cylinder, Acid of any type of Liquids (like Ghee Tin, Oil etc.) is totally prohibited.
                </div>

                {/* Customer Care */}
                <div className="bg-[#ff9999] text-center font-bold py-1 text-[11px]">
                  24x7 Customer Care Support 8093017401
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(/    <\/div>\n  \);\n}/, modalJSX + '\n    </div>\n  );\n}');
fs.writeFileSync('src/App.tsx', code);
