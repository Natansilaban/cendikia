import matematika from './matematika';
import fisika from './fisika';
import kimia from './kimia';
import biologi from './biologi';
import bahasaIndonesia from './bahasa-indonesia';
import bahasaInggris from './bahasa-inggris';
import sejarah from './sejarah';
import ekonomi from './ekonomi';
import geografi from './geografi';
import informatika from './informatika';
import pkn from './pkn';

const allQuestions = {
  'matematika': matematika,
  'fisika': fisika,
  'kimia': kimia,
  'biologi': biologi,
  'bahasa-indonesia': bahasaIndonesia,
  'bahasa-inggris': bahasaInggris,
  'sejarah': sejarah,
  'ekonomi': ekonomi,
  'geografi': geografi,
  'informatika': informatika,
  'pkn': pkn,
};

/**
 * Mendapatkan soal untuk mapel dan kelas tertentu (diacak)
 * @param {string} subjectId
 * @param {string} grade - 'X', 'XI', 'XII'
 * @param {number} count - jumlah soal yang diambil
 * @returns {Array}
 */
export function getQuestions(subjectId, grade, count = 10) {
  const bank = allQuestions[subjectId];
  if (!bank) return [];
  const gradeQuestions = bank[grade] || [];
  // Acak urutan soal
  const shuffled = [...gradeQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export default allQuestions;
