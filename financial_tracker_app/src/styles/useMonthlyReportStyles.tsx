import { useMemo } from "react";
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

export default function useMonthlyReportStyles() {
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
                paddingHorizontal: theme.spacing.lg,
                paddingTop: 60,
                paddingBottom: 15,
            },
            monthPickerContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: theme.spacing.lg,
                paddingBottom: theme.spacing.lg,
                gap: theme.spacing.sm,
            },
            monthNavButton: {
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.borderRadius.full,
                backgroundColor: theme.colors.backgroundLight,
            },
            monthDisplay: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.backgroundLight,
                paddingVertical: theme.spacing.sm,
                paddingHorizontal: theme.spacing.lg,
                borderRadius: theme.borderRadius.sm,
            },
            monthText: {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
            },
            lockedMonthContainer: {
                paddingHorizontal: theme.spacing.lg,
                paddingBottom: theme.spacing.lg,
                alignItems: 'center',
            },
            lockedMonthText: {
                fontSize: 18,
                fontWeight: '600',
                color: theme.colors.primary,
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
            loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            },
            scrollView: {
                flex: 1,
                paddingHorizontal: theme.spacing.lg,
            },
            summaryGrid: {
                flexDirection: 'row',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
            },
            summaryCard: {
                flex: 1,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.lg,
                alignItems: 'center',
            },
            incomeCard: {
                backgroundColor: theme.colors.greenCardBackground,
            },
            expenseCard: {
                backgroundColor: theme.colors.expenseDark,
            },
            summaryIcon: {
                fontSize: 32,
                marginBottom: theme.spacing.sm,
            },
            summaryLabel: {
                fontSize: 14,
                color: theme.colors.greenCardText,
                marginBottom: theme.spacing.xs,
            },
            summaryAmount: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.greenCardText,
            },
            balanceCard: {
                backgroundColor: theme.colors.backgroundLight,
                marginBottom: theme.spacing.xl,
            },
            balanceLabel: {
                fontSize: 16,
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
            },
            balanceAmount: {
                fontSize: 36,
                fontWeight: 'bold',
                marginBottom: theme.spacing.sm,
            },
            transactionCount: {
                fontSize: 14,
                color: theme.colors.textSecondary,
            },
            section: {
                marginBottom: theme.spacing.xl,
            },
            sectionTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: theme.spacing.md,
            },
            topCategoriesContainer: {
                gap: theme.spacing.sm,
            },
            topCategoryItem: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: theme.borderRadius.sm,
                padding: theme.spacing.md,
            },
            rankBadge: {
                width: 32,
                height: 32,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: theme.spacing.sm,
            },
            rankText: {
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.colors.background,
            },
            topCategoryInfo: {
                flex: 1,
            },
            topCategoryName: {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: theme.spacing.xs,
            },
            topCategoryAmount: {
                fontSize: 14,
                color: theme.colors.textSecondary,
            },
            topCategoryPercentage: {
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.primary,
            },
            breakdownContainer: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                gap: 8,
            },
            breakdownItem: {
                flex: 1,
                gap: theme.spacing.sm,
            },
            categoryIconContainer: {
                width: 44,
                height: 44,
                borderRadius: theme.borderRadius.sm,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
            },
            categoryIcon: {
                fontSize: 20,
            },
            breakdownHeader: {
                height: 44,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
            },
            breakdownLeftSection: {
                flex: 1,
            },
            breakdownCategory: {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
            },
            breakdownCount: {
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginTop: 2,
            },
            breakdownAmount: {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
            },
            breakdownBarContainer: {
                height: 8,
                backgroundColor: theme.colors.background,
                borderRadius: 4,
                overflow: 'hidden',
            },
            breakdownBar: {
                height: '100%',
                backgroundColor: theme.colors.primary,
                borderRadius: 4,
            },
            breakdownPercentage: {
                height: 32,
                fontSize: 12,
                color: theme.colors.textSecondary,
                verticalAlign: 'middle',
            },
            transactionsSublist: {
                paddingTop: theme.spacing.sm,
                gap: theme.spacing.sm,
            },
            transactionSubitem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: theme.spacing.sm,
                marginLeft: 16,
            },
            transactionSubitemLeft: {
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                gap: theme.spacing.sm,
            },
            transactionSubitemIcon: {
                fontSize: 20,
            },
            transactionSubitemInfo: {
                flex: 1,
            },
            transactionSubitemDescription: {
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 2,
            },
            transactionSubitemDate: {
                fontSize: 12,
                color: theme.colors.textSecondary,
            },
            transactionSubitemAmount: {
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginLeft: theme.spacing.sm,
            },
            emptyState: {
                alignItems: 'center',
                paddingVertical: 60,
            },
            emptyIcon: {
                fontSize: 64,
                marginBottom: theme.spacing.md,
            },
            emptyText: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: theme.spacing.sm,
            },
            emptySubtext: {
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                paddingHorizontal: theme.spacing.xxl,
            },
            bottomSpacer: {
                height: theme.spacing.xxl,
            },
            transactionIcon: {
                fontSize: 20,
            },
        });
    }, [theme]);
}