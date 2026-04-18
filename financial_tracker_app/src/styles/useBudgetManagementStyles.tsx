import { useMemo } from "react";
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';
import colors from "./colors";

export default function useBudgetManagementStyles() {
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
            headerCenter: {
                flex: 1,
                alignItems: 'center',
            },
            headerTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
            },
            headerSubtitle: {
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginTop: 2,
            },
            saveButton: {
                width: 70,
                alignItems: 'flex-end',
            },
            saveButtonText: {
                fontSize: 16,
                color: theme.colors.primary,
                fontWeight: '600',
            },
            saveButtonDisabled: {
                opacity: 0.5,
            },
            loadingContainer: {
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            },
            scrollView: {
                flex: 1,
                paddingHorizontal: 20,
            },
            totalCard: {
                backgroundColor: theme.colors.primary,
                borderRadius: 20,
                padding: 24,
                alignItems: 'center',
                marginBottom: 30,
            },
            totalLabel: {
                fontSize: 16,
                color: theme.colors.background,
                opacity: 0.8,
            },
            totalAmount: {
                fontSize: 42,
                fontWeight: 'bold',
                color: theme.colors.background,
                marginTop: 8,
            },
            section: {
                marginBottom: 30,
            },
            sectionTitle: {
                fontSize: 18,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 16,
            },
            categoriesList: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 16,
                padding: 12,
            },
            categoryItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.divider,
            },
            categoryItemLast: {
                borderBottomWidth: 0,
            },
            categoryLeft: {
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
            },
            categoryIconContainer: {
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: theme.colors.divider,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
            },
            categoryIcon: {
                fontSize: 20,
            },
            categoryName: {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
            },
            inputContainer: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                minWidth: 120,
            },
            currencySymbol: {
                fontSize: 16,
                color: theme.colors.primary,
                fontWeight: '600',
                marginRight: 4,
            },
            input: {
                flex: 1,
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: '600',
            },
            bottomSpacer: {
                height: 40,
            },
        });
    }, [theme]);
}