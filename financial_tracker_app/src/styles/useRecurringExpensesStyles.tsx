import { useMemo } from "react";
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';
import colors from "./colors";

export default function useRecurringExpensesStyles() {
    const { theme } = useTheme();

    return useMemo(() => {
        return StyleSheet.create({
            container: {
                flex: 1,
                backgroundColor: theme.colors.background,
            },
            header: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingTop: 60,
                paddingBottom: 20,
            },
            backButton: {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
            },
            headerTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
            },
            addButton: {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
            },
            loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            },
            emptyStateContainer: {
                flex: 1,
                paddingHorizontal: 20,
            },
            emptyState: {
                alignItems: 'center',
                paddingVertical: 60,
            },
            emptyIcon: {
                fontSize: 64,
                marginBottom: 16,
            },
            emptyText: {
                fontSize: 20,
                fontWeight: 'bold',
                color: '#ffffff',
                marginBottom: 8,
            },
            emptySubtext: {
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
            },
            expensesList: {
                gap: 16,
            },
            expenseCard: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                marginBottom: 8,
                paddingHorizontal: 8,
            },
            expenseContent: {
                padding: 16,
                paddingLeft: 20,
            },
            statusStripe: {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 8,
                backgroundColor: theme.colors.divider,
            },
            statusStripePaid: {
                backgroundColor: theme.colors.success,
            },
            statusStripeOverdue: {
                backgroundColor: theme.colors.danger,
            },
            statusStripeDueSoon: {
                backgroundColor: theme.colors.warning,
            },
            expenseHeader: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 12,
            },
            expenseIconContainer: {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: theme.colors.background,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
            },
            expenseIcon: {
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.primary,
            },
            expenseInfo: {
                flex: 1,
            },
            expenseNameRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 4,
            },
            expenseName: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#ffffff',
            },
            expenseNamePaid: {
                color: theme.colors.textDark,
            },
            paidBadge: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 12,
            },
            paidBadgeText: {
                fontSize: 11,
                fontWeight: '600',
                color: theme.colors.background,
            },
            expenseCategory: {
                fontSize: 14,
                color: theme.colors.textSecondary,
            },
            expenseCategoryPaid: {
                color: theme.colors.textDark,
                opacity: 0.7,
            },
            expenseAmount: {
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.primary,
            },
            expenseAmountPaid: {
                color: theme.colors.textDark,
            },
            expenseDetails: {
                gap: 8,
                marginBottom: 12,
                paddingBottom: 12,
            },
            detailRow: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                height: 32
            },
            detailLabel: {
                fontSize: 14,
                color: theme.colors.textSecondary,
            },
            detailLabelPaid: {
                color: theme.colors.textDark,
                opacity: 0.7,
            },
            detailValue: {
                fontSize: 14,
                color: theme.colors.text,
            },
            detailValuePaid: {
                color: theme.colors.textDark,
            },
            overdueText: {
                color: theme.colors.danger,
                fontWeight: 'bold',
            },
            dueSoonText: {
                color: theme.colors.warning,
                fontWeight: 'bold',
            },
            expenseActions: {
                flexDirection: 'row',
            },
            actionButton: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: 12,
                borderRadius: 8,
                backgroundColor: theme.colors.background,
            },
            actionButtonText: {
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.primary,
            },
            actionButtonUnpaid: {
                backgroundColor: theme.colors.primaryDark,
            },
            actionButtonUnpaidText: {
                color: theme.colors.warning,
            },
            swipeList: {
                paddingHorizontal: 20,
            },
            swipeListContent: {
                paddingBottom: 40,
            },
            rowBack: {
                alignItems: 'center',
                backgroundColor: theme.colors.danger,
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                paddingRight: 15,
                marginBottom: 16,
                borderRadius: 16,
            },
            deleteBtn: {
                alignItems: 'center',
                justifyContent: 'center',
                width: 100,
                height: '100%',
            },
            deleteBtnText: {
                color: '#ffffff',
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
            },
            bottomSpacer: {
                height: 40,
            },
            modalOverlay: {
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                justifyContent: 'flex-end',
            },
            modalContent: {
                backgroundColor: theme.colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 20,
                maxHeight: '90%',
            },
            modalHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                paddingBottom: 20,
            },
            modalTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
            },
            modalForm: {
                paddingHorizontal: 20,
            },
            inputLabel: {
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.textSecondary,
                marginBottom: 8,
                marginTop: 16,
            },
            input: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 12,
                padding: 16,
                fontSize: 16,
                color: theme.colors.text,
            },
            textArea: {
                height: 80,
                textAlignVertical: 'top',
            },
            categoryScroll: {
                marginBottom: 8,
            },
            categoryChip: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 16,
                paddingVertical: 10,
                marginRight: 8,
                borderRadius: 20,
                backgroundColor: theme.colors.backgroundLight,
            },
            categoryChipSelected: {
                backgroundColor: theme.colors.primary,
            },
            categoryChipIcon: {
                fontSize: 16,
            },
            categoryChipText: {
                fontSize: 14,
                color: theme.colors.text,
            },
            categoryChipTextSelected: {
                color: theme.colors.background,
                fontWeight: 'bold',
            },
            frequencyContainer: {
                flexDirection: 'row',
                gap: 8,
            },
            frequencyButton: {
                flex: 1,
                padding: 12,
                borderRadius: 8,
                backgroundColor: theme.colors.backgroundLight,
                alignItems: 'center',
            },
            frequencyButtonSelected: {
                backgroundColor: theme.colors.primary,
            },
            frequencyButtonText: {
                fontSize: 14,
                color: theme.colors.text,
            },
            frequencyButtonTextSelected: {
                color: theme.colors.background,
                fontWeight: 'bold',
            },
            dateButton: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 12,
                padding: 16,
            },
            dateButtonText: {
                fontSize: 16,
                color: theme.colors.text,
            },
            switchRow: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
            },
            submitButton: {
                backgroundColor: theme.colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginTop: 24,
                marginBottom: 40,
            },
            submitButtonText: {
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.background,
            },
        });
    }, [theme]);
}