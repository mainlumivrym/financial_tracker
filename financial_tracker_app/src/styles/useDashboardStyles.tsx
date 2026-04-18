import { useMemo } from "react";
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

export default function useDashboardStyles() {

    const { theme } = useTheme();

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: 20,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 60,
            marginBottom: 30,
        },
        greeting: {
            fontSize: 16,
            color: theme.colors.textSecondary,
        },
        userName: {
            fontSize: 24,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginTop: 4,
        },
        avatarContainer: {
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: theme.colors.backgroundLight,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        },
        profileImage: {
            width: '100%',
            height: '100%',
        },
        avatar: {
            fontSize: 24,
        },
        balanceCard: {
            backgroundColor: theme.colors.greenCardBackground,
            borderRadius: 20,
            padding: 24,
            marginBottom: 30,
        },
        balanceLabel: {
            fontSize: 16,
            color: theme.colors.greenCardText,
            opacity: 0.8,
        },
        balanceAmount: {
            fontSize: 36,
            fontWeight: 'bold',
            color: theme.colors.greenCardText,
            marginTop: 8,
            marginBottom: 20,
        },
        balanceStats: {
            flexDirection: 'row',
            justifyContent: 'space-around',
        },
        statItem: {
            flex: 1,
            alignItems: 'center',
        },
        statLabel: {
            fontSize: 14,
            color: theme.colors.greenCardText,
            opacity: 0.7,
            marginBottom: 4,
        },
        statIncome: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.greenCardText,
        },
        statExpense: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.greenCardText,
        },
        statDivider: {
            width: 1,
            backgroundColor: theme.colors.divider,
            opacity: 0.2,
            marginHorizontal: 20,
        },
        section: {
            marginBottom: 30,
        },
        sectionHeader: {
            height: 44,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
        },
        sectionTitle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 0,
        },
        seeAllText: {
            fontSize: 16,
            color: theme.colors.primary,
            fontWeight: '400',
        },
        actionsGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
        },
        actionButton: {
            width: '48%',
            backgroundColor: theme.colors.backgroundLight,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            marginBottom: 12,
        },
        actionIcon: {
            fontSize: 32,
            marginBottom: 8,
        },
        actionText: {
            fontSize: 14,
            color: theme.colors.text,
            textAlign: 'center',
        },
        transactionsList: {
            backgroundColor: theme.colors.backgroundLight,
            borderRadius: 16,
            padding: 16,
        },
        emptyState: {
            alignItems: 'center',
            paddingVertical: 30,
        },
        emptyStateText: {
            fontSize: 16,
            color: theme.colors.text,
            fontWeight: '600',
            marginBottom: 4,
        },
        emptyStateSubtext: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        alertsList: {
            gap: 12,
        },
        alertItem: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 16,
            borderRadius: 12,
            borderLeftWidth: 4,
        },
        alertItemWarning: {
            backgroundColor: '#3a3a2e',
            borderLeftColor: theme.colors.primary,
        },
        alertItemOver: {
            backgroundColor: '#3a2e2e',
            borderLeftColor: theme.colors.expense,
        },
        alertLeft: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        alertIcon: {
            fontSize: 24,
            marginRight: 12,
        },
        alertInfo: {
            flex: 1,
        },
        alertCategory: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
            marginBottom: 4,
        },
        alertText: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        alertPercentage: {
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.colors.primary,
        },
        alertPercentageOver: {
            color: theme.colors.expense,
        },
        budgetSummaryCard: {
            backgroundColor: theme.colors.backgroundLight,
            borderRadius: 16,
            padding: 16,
            paddingBottom: 8,
            marginBottom: 8,
        },
        budgetSummaryRow: {
            height: 32,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        budgetSummaryLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        budgetSummaryLabelBold: {
            fontSize: 15,
            color: theme.colors.text,
            fontWeight: '600',
        },
        budgetSummaryAmount: {
            fontSize: 16,
            color: theme.colors.text,
            fontWeight: '600',
        },
        budgetSummarySpent: {
            fontSize: 16,
            color: theme.colors.expense,
            fontWeight: '600',
        },
        budgetSummaryRemaining: {
            fontSize: 18,
            color: theme.colors.income,
            fontWeight: 'bold',
        },
        budgetSummaryOverBudget: {
            color: theme.colors.expense,
        },
        budgetSummaryDivider: {
            height: 1,
            backgroundColor: theme.colors.divider,
            marginVertical: 8,
        },
        budgetProgressList: {
            backgroundColor: theme.colors.backgroundLight,
            borderRadius: 16,
            padding: 16,
            gap: 20,
        },
        budgetItem: {
            gap: 8,
        },
        budgetHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        budgetCategory: {
            fontSize: 16,
            fontWeight: '600',
            color: theme.colors.text,
        },
        budgetAmount: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontWeight: '500',
        },
        progressBarContainer: {
            height: 8,
            backgroundColor: theme.colors.background,
            borderRadius: 4,
            overflow: 'hidden',
        },
        progressBar: {
            height: '100%',
            borderRadius: 4,
        },
        progressBarNormal: {
            backgroundColor: theme.colors.primary,
        },
        progressBarOver: {
            backgroundColor: theme.colors.expense,
        },
        budgetRemaining: {
            fontSize: 13,
            color: theme.colors.textSecondary,
        },
        budgetOver: {
            color: theme.colors.expense,
            fontWeight: '600',
        },
    });

    return useMemo(() => styles, [theme]);
}