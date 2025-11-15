const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

const app = createApp({
    setup() {
        // Reactive data
        const isLoading = ref(true);
        const tracking = reactive({});
        const stok = reactive([]);
        const paketList = ref(dataBahanAjar.paket);
        const pengirimanList = ref(dataBahanAjar.pengirimanList);
        const isSubmitting = ref(false);

        const newDO = reactive({
            nim: '',
            nama: '',
            paket: '',
            total: 0,
            tanggalKirim: new Date().toISOString().substr(0, 10),
            ekspedisi: ''
        });

        const selectedPaket = ref('');
        const isDetailsModalOpen = ref(false);
        const selectedDO = reactive({});

        // Computed properties
        const menuList = computed(() => [
            { name: 'Home', link: 'index.html', isActive: false },
            { name: 'Stok Bahan Ajar', link: 'stok.html', isActive: false },
            { name: 'Tracking DO', link: 'tracking.html', isActive: true }
        ]);

        const nextDONumber = computed(() => {
            const year = new Date().getFullYear();
            const doNumbers = Object.keys(tracking)
                .filter(key => key.startsWith(`DO${year}`))
                .map(key => parseInt(key.split('-')[1]));
            
            const nextNumber = doNumbers.length > 0 ? Math.max(...doNumbers) + 1 : 1;
            return `DO${year}-${nextNumber.toString().padStart(4, '0')}`;
        });

        const paketDetails = computed(() => {
            if (selectedPaket.value) {
                return paketList.value.find(p => p.kode === selectedPaket.value);
            }
            return null;
        });

        const hasActiveFilters = computed(() => {
            return Object.values(filters).some(value => value !== '');
        });

        // Watchers
        watch(tracking, (newTracking) => {
            localStorage.setItem('sitta-ut-tracking', JSON.stringify(newTracking));
        }, { deep: true });

        watch(selectedPaket, (newPaketKode) => {
            const paket = paketList.value.find(p => p.kode === newPaketKode);
            if (paket) {
                newDO.paket = paket.kode;
                newDO.total = paket.harga;
            } else {
                newDO.paket = '';
                newDO.total = 0;
            }
        });

        // Methods
        const getItemName = (kode) => {
            const item = stok.find(s => s.kode === kode);
            return item ? item.judul : 'Unknown Item';
        };

        const formatCurrency = (value) => {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
        };

        const getStatusClass = (status) => {
            const statusMap = {
                'Penerimaan di Loket': 'status-menipis status-badge',
                'Dalam Perjalanan': 'status-menipis status-badge', 
                'Terkirim': 'status-aman status-badge',
                'Gagal': 'status-kosong status-badge'
            };
            return statusMap[status] || 'status-menipis status-badge';
        };

        const addDO = () => {
            if (!newDO.nim || !newDO.nama || !selectedPaket.value || !newDO.tanggalKirim || !newDO.ekspedisi) {
                Swal.fire('Error', 'Semua kolom wajib diisi!', 'error');
                return;
            }

            isSubmitting.value = true;

            // Simulate API call delay
            setTimeout(() => {
                const doNumber = nextDONumber.value;
                tracking[doNumber] = {
                    ...newDO,
                    status: "Penerimaan di Loket",
                    perjalanan: [
                        { waktu: new Date().toLocaleString(), keterangan: "Penerimaan di Loket" }
                    ]
                };

                Swal.fire('Sukses', `Delivery Order ${doNumber} berhasil ditambahkan!`, 'success');
                
                // Reset form
                Object.assign(newDO, {
                    nim: '',
                    nama: '',
                    paket: '',
                    total: 0,
                    tanggalKirim: new Date().toISOString().substr(0, 10),
                    ekspedisi: ''
                });
                selectedPaket.value = '';
                isSubmitting.value = false;
            }, 1000);
        };

        const openDetailsModal = (doItem) => {
            Object.assign(selectedDO, doItem);
            selectedDO.doNumber = Object.keys(tracking).find(key => tracking[key] === doItem);
            isDetailsModalOpen.value = true;
        };

        const closeDetailsModal = () => {
            isDetailsModalOpen.value = false;
        };

        const resetForm = () => {
            Object.assign(newDO, {
                nim: '',
                nama: '',
                paket: '',
                total: 0,
                tanggalKirim: new Date().toISOString().substr(0, 10),
                ekspedisi: ''
            });
            selectedPaket.value = '';
        };

        onMounted(() => {
            setTimeout(() => {
                const savedTracking = JSON.parse(localStorage.getItem('sitta-ut-tracking'));
                const savedStok = JSON.parse(localStorage.getItem('sitta-ut-stok'));
                
                if (savedTracking && Object.keys(savedTracking).length > 0) {
                    Object.assign(tracking, savedTracking);
                } else {
                    Object.assign(tracking, dataBahanAjar.tracking);
                }
                
                if (savedStok && savedStok.length > 0) {
                    stok.push(...savedStok);
                } else {
                    stok.push(...dataBahanAjar.stok);
                }
                
                isLoading.value = false;
            }, 300);
        });

        return {
            // Reactive data
            isLoading,
            tracking,
            paketList,
            pengirimanList,
            newDO,
            selectedPaket,
            isDetailsModalOpen,
            selectedDO,
            isSubmitting,

            // Computed
            nextDONumber,
            paketDetails,
            menuList,
            hasActiveFilters,

            // Methods
            getItemName,
            formatCurrency,
            addDO,
            openDetailsModal,
            closeDetailsModal,
            getStatusClass,
            resetForm
        };
    }
});

app.mount('#app');
