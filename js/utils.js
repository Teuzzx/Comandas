/**
 * Funções utilitárias globais
 */
const Utils = {
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
    },

    formatDateTime(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(new Date(date));
    },

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
