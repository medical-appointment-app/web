export type Locale = 'en' | 'tr';

export const SUPPORTED_LOCALES: ReadonlyArray<{ value: Locale; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'tr', label: 'TR' },
];

const en = {
  'nav.home': 'Home',
  'nav.services': 'Services',
  'nav.book': 'Book Appointment',
  'nav.mine': 'My Appointments',
  'language.label': 'Language',

  'home.doctor.slotSuffix': '{minutes}-minute appointments',
  'home.jumpTo': 'Jump to:',
  'home.empty': 'No content pages yet.',

  'appt.title': 'Book an Appointment',
  'appt.step.pickDate': 'Pick a date',
  'appt.step.pickSlot': 'Choose a slot',
  'appt.step.confirm': 'Confirm',
  'appt.pickDate.hint': "Select the date you'd like to visit.",
  'appt.pickDate.cta': 'See Available Slots',
  'appt.slots.title': 'Available slots on {date}',
  'appt.slots.changeDate': '\u2190 Change date',
  'appt.slots.emptyDay': 'No slots available on this day. Please try another date.',
  'appt.slots.emptyToday': 'No more slots available today. Please try another date.',
  'appt.slots.minutes': '{minutes} min',
  'appt.confirm.dateTime': 'Date & time',
  'appt.confirm.duration': 'Duration',
  'appt.confirm.durationValue': '{minutes} minutes',
  'appt.confirm.back': '\u2190 Back',
  'appt.confirm.cta': 'Confirm Appointment',
  'appt.confirm.success': 'Appointment confirmed!',
  'appt.result.title': 'Appointment Confirmed!',
  'appt.result.subtitle': 'Scheduled for {when} \u00b7 {minutes} min',
  'appt.result.viewMine': 'View My Appointments',
  'appt.lockExpired': 'Your hold expired. Please choose a slot again.',

  'mine.title': 'My Appointments',
  'mine.col.dateTime': 'Date & Time',
  'mine.col.duration': 'Duration',
  'mine.col.status': 'Status',
  'mine.col.notes': 'Notes',
  'mine.col.action': 'Action',
  'mine.empty': "You don't have any appointments yet.",
  'mine.cancel': 'Cancel',
  'mine.cancel.confirm': 'Cancel this appointment?',
  'mine.cancel.yes': 'Yes',
  'mine.cancel.no': 'No',
  'mine.cancel.success': 'Appointment cancelled.',
  'mine.duration.minutes': '{minutes} min',

  'status.LOCKED': 'Locked',
  'status.PENDING': 'Pending',
  'status.CONFIRMED': 'Confirmed',
  'status.CANCELLED': 'Cancelled',
  'status.COMPLETED': 'Completed',

  'catalog.title': 'Services & Products',
  'catalog.filter': 'Filter by category',
  'catalog.unavailable': 'Unavailable',

  'date.longFormat': 'MMMM D, YYYY',
  'date.dayFormat': 'dddd, MMMM D YYYY [at] HH:mm',
  'date.tableFormat': 'MMM D, YYYY \u00b7 HH:mm',
};

type Keys = keyof typeof en;

const tr: Record<Keys, string> = {
  'nav.home': 'Ana Sayfa',
  'nav.services': 'Hizmetler',
  'nav.book': 'Randevu Al',
  'nav.mine': 'Randevularım',
  'language.label': 'Dil',

  'home.doctor.slotSuffix': '{minutes} dakikalık randevular',
  'home.jumpTo': 'Hızlı geçiş:',
  'home.empty': 'Henüz içerik sayfası yok.',

  'appt.title': 'Randevu Al',
  'appt.step.pickDate': 'Tarih seç',
  'appt.step.pickSlot': 'Saat seç',
  'appt.step.confirm': 'Onayla',
  'appt.pickDate.hint': 'Gelmek istediğiniz tarihi seçin.',
  'appt.pickDate.cta': 'Uygun Saatleri Gör',
  'appt.slots.title': '{date} için uygun saatler',
  'appt.slots.changeDate': '\u2190 Tarihi değiştir',
  'appt.slots.emptyDay': 'Bu gün için uygun saat yok. Lütfen başka bir tarih deneyin.',
  'appt.slots.emptyToday': 'Bugün için kalan uygun saat yok. Lütfen başka bir tarih deneyin.',
  'appt.slots.minutes': '{minutes} dk',
  'appt.confirm.dateTime': 'Tarih ve saat',
  'appt.confirm.duration': 'Süre',
  'appt.confirm.durationValue': '{minutes} dakika',
  'appt.confirm.back': '\u2190 Geri',
  'appt.confirm.cta': 'Randevuyu Onayla',
  'appt.confirm.success': 'Randevu onaylandı!',
  'appt.result.title': 'Randevu Onaylandı!',
  'appt.result.subtitle': '{when} \u00b7 {minutes} dk',
  'appt.result.viewMine': 'Randevularımı Gör',
  'appt.lockExpired': 'Tutulan saatin süresi doldu. Lütfen tekrar bir saat seçin.',

  'mine.title': 'Randevularım',
  'mine.col.dateTime': 'Tarih ve Saat',
  'mine.col.duration': 'Süre',
  'mine.col.status': 'Durum',
  'mine.col.notes': 'Notlar',
  'mine.col.action': 'İşlem',
  'mine.empty': 'Henüz bir randevunuz bulunmuyor.',
  'mine.cancel': 'İptal Et',
  'mine.cancel.confirm': 'Bu randevu iptal edilsin mi?',
  'mine.cancel.yes': 'Evet',
  'mine.cancel.no': 'Hayır',
  'mine.cancel.success': 'Randevu iptal edildi.',
  'mine.duration.minutes': '{minutes} dk',

  'status.LOCKED': 'Tutuldu',
  'status.PENDING': 'Beklemede',
  'status.CONFIRMED': 'Onaylandı',
  'status.CANCELLED': 'İptal',
  'status.COMPLETED': 'Tamamlandı',

  'catalog.title': 'Hizmetler ve Ürünler',
  'catalog.filter': 'Kategoriye göre filtrele',
  'catalog.unavailable': 'Mevcut değil',

  'date.longFormat': 'D MMMM YYYY',
  'date.dayFormat': 'dddd, D MMMM YYYY, HH:mm',
  'date.tableFormat': 'D MMM YYYY \u00b7 HH:mm',
};

export const dictionaries: Record<Locale, Record<Keys, string>> = { en, tr };
export type TranslationKey = Keys;
