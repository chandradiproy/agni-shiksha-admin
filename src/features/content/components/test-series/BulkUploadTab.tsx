// src/features/content/components/test-series/BulkUploadTab.tsx
import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, CheckCircle, AlertCircle, Save, FileText, Lock, Download, Loader2, Edit2, X } from 'lucide-react';
import { questionService } from '../../services/question.service';
import { useUIStore } from '../../../../store/uiStore';
import type { TestSeries } from '../../types';

interface BulkUploadTabProps {
  selectedTs: TestSeries;
}

export const BulkUploadTab: React.FC<BulkUploadTabProps> = ({ selectedTs }) => {
  const addToast = useUIStore(state => state.addToast);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // --- API Mutations ---
  const previewMutation = useMutation({
    mutationFn: (file: File) => questionService.previewBulk(selectedTs.id, file),
    onSuccess: (res: any) => {
      // FIX: Backend returns { preview: [...] }, not { data: [...] }
      setPreviewRows(res.preview || []);
      addToast('File processed. Please review the data below.', 'success');
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to parse file', 'error')
  });

  const commitMutation = useMutation({
    mutationFn: (rows: any[]) => questionService.commitBulk(selectedTs.id, rows),
    onSuccess: () => {
      addToast('Questions successfully uploaded to database!', 'success');
      setPreviewRows([]);
      queryClient.invalidateQueries({ queryKey: ['questions', selectedTs.id] });
    },
    onError: (err: any) => addToast(err.response?.data?.error || 'Failed to commit to database', 'error')
  });

  // --- Handlers ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) previewMutation.mutate(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFinalUploadToDB = () => {
    if (previewRows.some(r => !r.isValid)) {
      addToast('Please fix or remove invalid rows before committing.', 'error');
      return;
    }
    // We send back the exact parsed data payloads that the preview returned
    const payload = previewRows.map(r => r.data);
    commitMutation.mutate(payload);
  };

  const downloadTemplate = () => {
    // Exact schema based on the provided CSV
    const csvContent = "exam_slug,subject,topic,section,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,difficulty,marks\nssc-cgl-2026,Mathematics,Algebra,Quantitative Aptitude,What is the value of 5 + 7?,10,11,12,13,c,Basic addition: 5 + 7 = 12.,easy,2\n";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "agni_shiksha_questions_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Inline Edit Handlers ---
  const handleEditRow = (index: number) => {
    setEditingIndex(index);
    setEditFormData(previewRows[index].data);
  };

  const saveEdit = (index: number) => {
    const updatedRows = [...previewRows];
    const data = editFormData;
    
    // Client side re-validation
    let errors: string[] = [];
    if (!data.subject) errors.push("Subject is required");
    if (!data.topic) errors.push("Topic is required");
    if (!data.question_text) errors.push("Question text is required");
    if (!data.option_a || !data.option_b) errors.push("Options A and B are required");
    if (!data.correct_option) errors.push("Correct option is required");

    updatedRows[index] = {
      ...updatedRows[index],
      data,
      isValid: errors.length === 0,
      // Store errors back as an object to match backend format or array
      errors: errors.reduce((acc, err, i) => ({ ...acc, [i]: err }), {}) 
    };
    
    setPreviewRows(updatedRows);
    setEditingIndex(null);
    if (errors.length === 0) addToast("Row fixed successfully", "success");
  };

  if (selectedTs.is_published) {
    return (
      <div className="bg-orange-50 border border-orange-200 text-orange-800 p-5 sm:p-6 rounded-xl flex items-start shadow-sm">
        <Lock className="w-6 h-6 mr-3 sm:mr-4 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-bold text-base sm:text-lg">Test is Currently Live</h3>
          <p className="text-xs sm:text-sm mt-1 leading-relaxed">This test series has been published. To protect student attempt records and leaderboard integrity, you cannot bulk upload new questions right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in pb-12">
      <div className="flex justify-end mb-4">
        <button onClick={downloadTemplate} className="text-sm text-primary font-semibold flex items-center hover:underline">
          <Download className="w-4 h-4 mr-1.5" /> Download CSV Template
        </button>
      </div>

      {previewRows.length === 0 ? (
        <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center bg-gray-50 hover:bg-primary-light/20 hover:border-primary/50 transition-colors cursor-pointer group">
          <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} disabled={previewMutation.isPending} />
          {previewMutation.isPending ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          ) : (
            <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-8 h-8 text-primary" />
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 text-center">{previewMutation.isPending ? 'Analyzing CSV...' : 'Upload Question CSV'}</h3>
          <p className="text-sm text-gray-500 mt-2 text-center max-w-md px-4">Drag and drop your standard Agni Shiksha CSV format here.</p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 sm:p-5 rounded-xl border border-gray-200 gap-4">
            <div className="flex items-center gap-4">
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500 shrink-0" />
              <div>
                <h3 className="font-bold text-gray-900 text-sm sm:text-base">CSV Parsed Successfully</h3>
                <p className="text-xs text-gray-500">{previewRows.length} questions identified. Please review before committing.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setPreviewRows([])} className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleFinalUploadToDB} disabled={commitMutation.isPending} className={`flex-1 sm:flex-none px-4 py-2.5 text-white rounded-lg text-sm font-semibold flex items-center justify-center transition-colors shadow-sm ${previewRows.some(r => !r.isValid) || commitMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
                {commitMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} 
                Commit to DB
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-sm relative">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-gray-600 w-16 text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 min-w-[300px]">Parsed Question Data</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((row, index) => {
                    // FIX: Backend sends errors as an object. We extract the values into an array to map over.
                    const errorList = Object.values(row.errors || {}) as string[];
                    
                    return (
                      <tr key={index} className={row.isValid ? 'bg-white hover:bg-gray-50/50' : 'bg-red-50/30'}>
                        
                        <td className="px-4 py-4 align-top text-center">
                          {row.isValid ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> : <AlertCircle className="w-5 h-5 text-red-500 mx-auto" />}
                        </td>
                        
                        <td className="px-4 py-4">
                          {editingIndex === index ? (
                            // INLINE EDIT MODE
                            <div className="space-y-3 bg-white p-4 rounded-lg border border-primary ring-1 ring-primary/20 shadow-sm">
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.subject || ''} onChange={e => setEditFormData({...editFormData, subject: e.target.value})} placeholder="Subject" />
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.topic || ''} onChange={e => setEditFormData({...editFormData, topic: e.target.value})} placeholder="Topic" />
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.difficulty || ''} onChange={e => setEditFormData({...editFormData, difficulty: e.target.value})} placeholder="Difficulty" />
                                <select className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.correct_option || ''} onChange={e => setEditFormData({...editFormData, correct_option: e.target.value})}>
                                  <option value="">Select Correct Option</option><option value="a">A</option><option value="b">B</option><option value="c">C</option><option value="d">D</option>
                                </select>
                              </div>
                              <textarea className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none resize-none text-sm" value={editFormData.question_text || ''} onChange={e => setEditFormData({...editFormData, question_text: e.target.value})} rows={2} placeholder="Question Text"/>
                              <div className="grid grid-cols-2 gap-2">
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.option_a || ''} onChange={e => setEditFormData({...editFormData, option_a: e.target.value})} placeholder="Option A" />
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.option_b || ''} onChange={e => setEditFormData({...editFormData, option_b: e.target.value})} placeholder="Option B" />
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.option_c || ''} onChange={e => setEditFormData({...editFormData, option_c: e.target.value})} placeholder="Option C" />
                                <input className="px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary outline-none text-xs" value={editFormData.option_d || ''} onChange={e => setEditFormData({...editFormData, option_d: e.target.value})} placeholder="Option D" />
                              </div>
                            </div>
                          ) : (
                            // VIEW MODE
                            <>
                              <div className="flex flex-wrap gap-2 mb-2">
                                <span className="bg-gray-100 border border-gray-200 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{row.data.subject || 'NO SUBJECT'}</span>
                                <span className="bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded text-[10px] font-semibold">{row.data.topic || 'No Topic'}</span>
                                <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-semibold capitalize">{row.data.difficulty || 'medium'}</span>
                              </div>
                              <p className="text-gray-900 font-medium text-sm whitespace-normal line-clamp-2 mb-2">{row.data.question_text}</p>
                              
                              <div className="space-y-1 max-w-sm">
                                {['a', 'b', 'c', 'd'].map((opt) => (
                                  row.data[`option_${opt}`] ? (
                                    <div key={opt} className={`flex items-center text-xs px-2 py-1 rounded ${row.data.correct_option === opt ? 'bg-green-50 text-green-700 font-medium border border-green-200' : 'text-gray-600 border border-transparent'}`}>
                                      <span className="uppercase w-5 font-bold">{opt}.</span> <span className="truncate">{row.data[`option_${opt}`]}</span>
                                    </div>
                                  ) : null
                                ))}
                              </div>

                              {!row.isValid && errorList.length > 0 && (
                                <div className="mt-3 text-xs text-red-700 bg-red-100/50 border border-red-200 p-2.5 rounded-lg font-medium whitespace-normal">
                                  <span className="font-bold">Errors found:</span> {errorList.join(' • ')}
                                </div>
                              )}
                            </>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top text-right">
                          {editingIndex === index ? (
                            <div className="flex flex-col gap-2 items-end">
                              <button onClick={() => saveEdit(index)} className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-semibold flex items-center hover:bg-green-700 transition-colors shadow-sm"><Save className="w-3 h-3 mr-1"/> Save</button>
                              <button onClick={() => setEditingIndex(null)} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold flex items-center hover:bg-gray-200 transition-colors shadow-sm"><X className="w-3 h-3 mr-1"/> Cancel</button>
                            </div>
                          ) : (
                            <button onClick={() => handleEditRow(index)} className="p-2 text-primary bg-primary-light/30 hover:bg-primary-light hover:text-primary-hover rounded-lg transition-colors border border-transparent hover:border-primary-light flex items-center ml-auto">
                              <Edit2 className="w-4 h-4 mr-1" /> Edit
                            </button>
                          )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};