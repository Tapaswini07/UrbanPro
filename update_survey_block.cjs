const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\{adminTab === 'add-survey' && \([\s\S]*?(?=\{adminTab === 'add-quotation')/;

const replacement = `{adminTab === 'add-survey' && (
                <div className="max-w-4xl mx-auto pb-12">
                  <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <h1 className="text-xl font-bold text-slate-800">{editingSurveyId ? 'Edit Survey List' : 'Add Survey List'}</h1>
                    <button onClick={() => { setAdminTab('list-survey'); setEditingSurveyId(null); setSurveyForm(initialSurveyForm); }} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
                      All Survey Lists
                    </button>
                  </div>

                  <div className="bg-blue-50/50 text-blue-800 p-3.5 rounded-lg border border-blue-100 mb-8 flex items-center gap-2 font-medium">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    Details from Quotation
                  </div>

                  <div className="space-y-8">
                    {/* Survey Details Section */}
                    <div className="border-2 border-green-400 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-green-400 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Survey Details</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Survey No. *</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.surveyNo} onChange={e => setSurveyForm({...surveyForm, surveyNo: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Survey Date *</label>
                          <input type="date" className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none" value={surveyForm.surveyDate} onChange={e => setSurveyForm({...surveyForm, surveyDate: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Party Name *</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.partyName} onChange={e => setSurveyForm({...surveyForm, partyName: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Client Mobile No.</label>
                          <input type="tel" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.mobileNo} onChange={e => setSurveyForm({...surveyForm, mobileNo: e.target.value})} />
                        </div>
                      </div>
                    </div>

                    {/* Relocate From Section */}
                    <div className="border-2 border-slate-400 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-slate-500 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Relocate From</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.fromCountry} onChange={e => setSurveyForm({...surveyForm, fromCountry: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <select className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer" value={surveyForm.fromState} onChange={e => setSurveyForm({...surveyForm, fromState: e.target.value})}>
                            <option value="">Select State</option>
                            <option>Odisha</option>
                            <option>Maharashtra</option>
                            <option>Delhi</option>
                            <option>Karnataka</option>
                            <option>Tamil Nadu</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.fromCity} onChange={e => setSurveyForm({...surveyForm, fromCity: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.fromArea} onChange={e => setSurveyForm({...surveyForm, fromArea: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.fromPinCode} onChange={e => setSurveyForm({...surveyForm, fromPinCode: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">From Floor</label>
                          <select className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer" value={surveyForm.fromFloor} onChange={e => setSurveyForm({...surveyForm, fromFloor: e.target.value})}>
                            <option>Ground</option>
                            <option>Basement</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>3rd Floor</option>
                            <option>4th Floor</option>
                            <option>5th Floor</option>
                            <option>6th Floor</option>
                            <option>7th Floor</option>
                            <option>8th Floor</option>
                            <option>9th Floor</option>
                            <option>10th Floor</option>
                            <option>Above 10th Floor</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-slate-500 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Lift Available</label>
                          <select className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer" value={surveyForm.fromLift} onChange={e => setSurveyForm({...surveyForm, fromLift: e.target.value})}>
                            <option>Not Required</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Relocate To Section */}
                    <div className="border-2 border-orange-300 rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-orange-300 text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Relocate To</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Country</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.toCountry} onChange={e => setSurveyForm({...surveyForm, toCountry: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">State</label>
                          <select className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer" value={surveyForm.toState} onChange={e => setSurveyForm({...surveyForm, toState: e.target.value})}>
                            <option value="">Select State</option>
                            <option>Odisha</option>
                            <option>Maharashtra</option>
                            <option>Delhi</option>
                            <option>Karnataka</option>
                            <option>Tamil Nadu</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">City</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.toCity} onChange={e => setSurveyForm({...surveyForm, toCity: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Area</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.toArea} onChange={e => setSurveyForm({...surveyForm, toArea: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Pin Code</label>
                          <input type="text" className="w-full outline-none text-slate-800 text-sm bg-transparent" value={surveyForm.toPinCode} onChange={e => setSurveyForm({...surveyForm, toPinCode: e.target.value})} />
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">To Floor</label>
                          <select className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer" value={surveyForm.toFloor} onChange={e => setSurveyForm({...surveyForm, toFloor: e.target.value})}>
                            <option>Ground</option>
                            <option>Basement</option>
                            <option>1st Floor</option>
                            <option>2nd Floor</option>
                            <option>3rd Floor</option>
                            <option>4th Floor</option>
                            <option>5th Floor</option>
                            <option>6th Floor</option>
                            <option>7th Floor</option>
                            <option>8th Floor</option>
                            <option>9th Floor</option>
                            <option>10th Floor</option>
                            <option>Above 10th Floor</option>
                          </select>
                        </div>
                        <div className="border border-slate-300 rounded-lg p-2 focus-within:border-orange-400 transition-all bg-white relative">
                          <label className="block text-[11px] text-slate-500 font-medium mb-0.5">Lift Available</label>
                          <select className="w-full outline-none text-slate-800 text-sm bg-transparent appearance-none cursor-pointer" value={surveyForm.toLift} onChange={e => setSurveyForm({...surveyForm, toLift: e.target.value})}>
                            <option>Not Required</option>
                            <option>Yes</option>
                            <option>No</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Add Items List */}
                    <div className="border-2 border-[#1a1a2e] rounded-xl p-6 pt-8 relative bg-white shadow-sm">
                      <span className="absolute -top-3.5 left-4 bg-[#1a1a2e] text-white px-4 py-1 rounded-md text-sm font-medium shadow-sm">Add Items List</span>
                      
                      <div className="flex gap-3 mb-6">
                        <div className="flex-1">
                          <input type="text" placeholder="Item Name" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-[#1a1a2e] text-sm" value={currentItem.name} onChange={(e) => setCurrentItem({...currentItem, name: e.target.value})} />
                        </div>
                        <div className="w-24">
                          <input type="number" placeholder="Qty" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-[#1a1a2e] text-sm" value={currentItem.qty} onChange={(e) => setCurrentItem({...currentItem, qty: e.target.value})} />
                        </div>
                        <div className="flex-1">
                          <input type="text" placeholder="Value" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-[#1a1a2e] text-sm" value={currentItem.value} onChange={(e) => setCurrentItem({...currentItem, value: e.target.value})} />
                        </div>
                        <div className="flex-1">
                          <input type="text" placeholder="Remark" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-[#1a1a2e] text-sm" value={currentItem.remark} onChange={(e) => setCurrentItem({...currentItem, remark: e.target.value})} />
                        </div>
                        <button onClick={addItemToSurvey} className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-lg flex items-center justify-center transition-colors shrink-0">
                          <PlusCircle className="w-5 h-5" />
                        </button>
                      </div>

                      {surveyForm.items.length > 0 && (
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-slate-600 font-medium">
                              <tr>
                                <th className="px-4 py-3 border-b">Sr.</th>
                                <th className="px-4 py-3 border-b">Item Name</th>
                                <th className="px-4 py-3 border-b text-center">Qty</th>
                                <th className="px-4 py-3 border-b">Value</th>
                                <th className="px-4 py-3 border-b">Remark</th>
                                <th className="px-4 py-3 border-b text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {surveyForm.items.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                                  <td className="px-4 py-3 text-center text-slate-600">{item.qty}</td>
                                  <td className="px-4 py-3 text-slate-600">{item.value || '-'}</td>
                                  <td className="px-4 py-3 text-slate-600">{item.remark || '-'}</td>
                                  <td className="px-4 py-3 text-right">
                                    <button onClick={() => removeItemFromSurvey(idx)} className="text-red-500 hover:text-red-700 p-1">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                  </div>

                  <div className="mt-8 text-center">
                    <button onClick={handleSaveSurvey} className="bg-[#0088cc] hover:bg-blue-600 text-white px-10 py-2.5 rounded text-sm font-medium transition-colors shadow-sm">
                      {editingSurveyId ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
