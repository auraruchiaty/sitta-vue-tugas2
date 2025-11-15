const { createApp, ref, reactive, computed, watch, onMounted } = Vue;

const app = createApp({
    setup() {
        const isLoading = ref(true);
        const stok = reactive([]);
        const upbjjList = ref(dataBahanAjar.upbjjList);
        const kategoriList = ref(dataBahanAjar.kategoriList);

        const filters = reactive({
            upbjj: '',
            kategori: '',
            status: ''
        });

        const sort = reactive({
            by: 'judul',
            order: 'asc'
        });

        const isModalOpen = ref(false);
        const isNew = ref(true);
        const currentItem = reactive({});

        onMounted(() => {

            setTimeout(() => {
                const savedStok = JSON.parse(localStorage.getItem('sitta-ut-stok'));
                if (savedStok && savedStok.length > 0) {
                    stok.push(...savedStok);
                } else {
                    stok.push(...dataBahanAjar.stok);
                }
                isLoading.value = false;
            }, 300);
        });

        watch(stok, (newStok) => {
            localStorage.setItem('sitta-ut-stok', JSON.stringify(newStok));
        }, { deep: true });

        const availableKategori = computed(() => {
            if (!filters.upbjj) {
                return kategoriList.value;
            }
            
            const kategoriInUpbjj = [...new Set(
                stok
                    .filter(item => item.upbjj === filters.upbjj)
                    .map(item => item.kategori)
            )];
            
            return kategoriInUpbjj;
        });

        const filteredAndSortedStok = computed(() => {
            let result = [...stok];

            if (filters.upbjj) {
                result = result.filter(item => item.upbjj === filters.upbjj);
            }
            if (filters.kategori) {
                result = result.filter(item => item.kategori === filters.kategori);
            }
            if (filters.status) {
                result = result.filter(item => getStatusText(item) === filters.status);
            }

            result.sort((a, b) => {
                let comparison = 0;
                if (a[sort.by] > b[sort.by]) {
                    comparison = 1;
                } else if (a[sort.by] < b[sort.by]) {
                    comparison = -1;
                }
                return sort.order === 'asc' ? comparison : -comparison;
            });

            return result;
        });

        const getStatusText = (item) => {
            if (item.qty === 0) return 'Kosong';
            if (item.qty < item.safety) return 'Menipis';
            return 'Aman';
        };

        const getStatusClass = (item) => {
            const status = getStatusText(item);
            if (status === 'Aman') return 'status-aman status-badge';
            if (status === 'Menipis') return 'status-menipis status-badge';
            return 'status-kosong status-badge';
        };

        const formatCurrency = (value) => {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
        };

        const openModal = (newItem, item = null) => {
            isNew.value = newItem;
            Object.assign(currentItem, newItem ? {
                kode: '', judul: '', kategori: '', upbjj: '', lokasiRak: '', harga: 0, qty: 0, safety: 0, catatanHTML: ''
            } : { ...item });
            isModalOpen.value = true;
        };

        const closeModal = () => {
            isModalOpen.value = false;
        };

        const saveStok = () => {
            if (!currentItem.kode || !currentItem.judul || !currentItem.kategori || !currentItem.upbjj) {
                Swal.fire('Error', 'Kolom Kode, Judul, Kategori, dan UPBJJ wajib diisi!', 'error');
                return;
            }
            if (currentItem.qty < 0 || currentItem.safety < 0) {
                Swal.fire('Error', 'Stok (qty) dan Safety tidak boleh minus!', 'error');
                return;
            }

            if (isNew.value) {
                if (stok.some(item => item.kode === currentItem.kode)) {
                    Swal.fire('Error', 'Kode bahan ajar sudah ada!', 'error');
                    return;
                }
                stok.push({ ...currentItem });
                Swal.fire('Sukses', 'Stok berhasil ditambahkan!', 'success');
            } else {
                const index = stok.findIndex(item => item.kode === currentItem.kode);
                if (index !== -1) {
                    stok[index] = { ...currentItem };
                    Swal.fire('Sukses', 'Stok berhasil diperbarui!', 'success');
                }
            }
            closeModal();
        };

        const deleteStok = (kode) => {
            Swal.fire({
                title: 'Anda yakin?',
                text: "Data yang dihapus tidak dapat dikembalikan!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, hapus!'
            }).then((result) => {
                if (result.isConfirmed) {
                    const index = stok.findIndex(item => item.kode === kode);
                    if (index !== -1) {
                        stok.splice(index, 1);
                        Swal.fire('Terhapus!', 'Data stok telah dihapus.', 'success');
                    }
                }
            });
        };

        const resetKategoriFilter = () => {
            filters.kategori = '';
        };

        return {
            isLoading,
            stok,
            upbjjList,
            kategoriList: availableKategori,
            filters,
            sort,
            isModalOpen,
            isNew,
            currentItem,
            filteredAndSortedStok,
            getStatusText,
            getStatusClass,
            formatCurrency,
            openModal,
            closeModal,
            saveStok,
            deleteStok,
            resetKategoriFilter
        };
    }
});

app.mount('#app');
