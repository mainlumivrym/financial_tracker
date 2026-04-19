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
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 40,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: 16,
        },
        emptyText: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.colors.text,
            marginBottom: 8,
        },
        emptySubtext: {
            fontSize: 16,
            color: theme.colors.textSecondary,
            textAlign: 'center',
        },
        scrollView: {
            flex: 1,
        },
        listContent: {
            paddingHorizontal: 20,
        },
        sectionHeader: {
            height: 44,
            backgroundColor: theme.colors.background,
            paddingVertical: 12,
            paddingHorizontal: 20,
            marginHorizontal: -20,
        },
        dateHeader: {
            fontSize: 16,
            fontWeight: 'bold',
            color: theme.colors.text,
        },
        itemContainer: {
            backgroundColor: theme.colors.backgroundLight,
            paddingHorizontal: 12,
        },
        itemContainerFirst: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingTop: 4,
        },
        itemContainerLast: {
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
            paddingBottom: 4,
        },
        rowBack: {
            alignItems: 'center',
            backgroundColor: theme.colors.expense,
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
        },
        rowBackFirst: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
        },
        rowBackLast: {
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16,
        },
        deleteButton: {
            alignItems: 'center',
            justifyContent: 'center',
            width: 75,
            alignSelf: 'center',
        },
        monthSummary: {
            backgroundColor: theme.colors.backgroundLight,
            borderRadius: 16,
            padding: 16,
            marginTop: 12,
            marginBottom: 24,
        },
        summaryRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        summaryLabel: {
            fontSize: 14,
            color: theme.colors.textSecondary,
        },
        summaryIncome: {
            fontSize: 14,
            color: theme.colors.income,
            fontWeight: '600',
        },
        summaryExpense: {
            fontSize: 14,
            color: theme.colors.expense,
            fontWeight: '600',
        },
        summaryTotal: {
            marginTop: 8,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.colors.divider,
        },
        summaryTotalLabel: {
            fontSize: 16,
            color: theme.colors.text,
            fontWeight: 'bold',
        },
        summaryTotalAmount: {
            fontSize: 18,
            fontWeight: 'bold',
        },
        bottomSpacer: {
            height: 40,
        },
    });

    return useMemo(() => styles, [theme]);
}