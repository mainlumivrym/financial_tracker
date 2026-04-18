import { useMemo } from "react";
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

export default function useAddTransactionsStyles() {
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
                padding: 8,
            },
            headerTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
            },
            saveHeaderButton: {
                padding: 8,
            },
            saveHeaderButtonText: {
                fontSize: 16,
                color: '#4ecca3',
                fontWeight: '600',
            },
            saveHeaderButtonDisabled: {
                opacity: 0.5,
            },
            mainContent: {
                flex: 1,
                flexDirection: 'row',
            },
            leftColumn: {
                flex: 1,
                paddingHorizontal: 20,
            },
            rightColumn: {
                width: 132,
                backgroundColor: theme.colors.backgroundDark,
                paddingVertical: 20,
                paddingHorizontal: 12,
                borderLeftWidth: 1,
                borderLeftColor: theme.colors.divider,
            },
            categoriesTitle: {
                fontSize: 14,
                fontWeight: '600',
                color: theme.colors.textSecondary,
                marginBottom: 12,
                textAlign: 'center',
            },
            amountSection: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginVertical: 30,
            },
            currencySymbol: {
                fontSize: 40,
                fontWeight: 'bold',
                color: theme.colors.primary,
                marginRight: 8,
            },
            amountInput: {
                fontSize: 48,
                fontWeight: 'bold',
                color: theme.colors.text,
                minWidth: 120,
            },
            section: {
                marginBottom: 24,
            },
            sectionTitle: {
                fontSize: 16,
                fontWeight: '600',
                color: theme.colors.text,
                marginBottom: 12,
            },
            categoriesScroll: {
                flex: 1,
            },
            categoriesScrollContent: {
                paddingBottom: 20,
            },
            categoryItem: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
                alignItems: 'center',
                borderWidth: 2,
                borderColor: 'transparent',
                position: 'relative',
            },
            categoryItemSelected: {
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primaryDark,
            },
            categoryItemIcon: {
                fontSize: 32,
                marginBottom: 6,
            },
            categoryItemText: {
                fontSize: 11,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                fontWeight: '500',
            },
            categoryItemTextSelected: {
                color: theme.colors.primary,
                fontWeight: '600',
            },
            checkmark: {
                position: 'absolute',
                top: 6,
                right: 6,
            },
            addCategoryItem: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 12,
                padding: 12,
                marginBottom: 10,
                alignItems: 'center',
                borderWidth: 0,
                borderColor: theme.colors.primary,
                borderStyle: 'solid',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 6,
            },
            addCategoryItemText: {
                fontSize: 11,
                color: theme.colors.primary,
                fontWeight: '600',
            },
            loadingText: {
                color: theme.colors.textSecondary,
                fontSize: 14,
                padding: 16,
            },
            dateButton: {
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 12,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.backgroundLight,
            },
            dateText: {
                flex: 1,
                marginLeft: 12,
                color: theme.colors.text,
                fontSize: 16,
            },
            doneButton: {
                backgroundColor: theme.colors.primary,
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 12,
            },
            doneButtonText: {
                color: theme.colors.background,
                fontSize: 16,
                fontWeight: '600',
            },
            descriptionInput: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 12,
                padding: 14,
                fontSize: 15,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.divider,
                minHeight: 110,
                textAlignVertical: 'top',
            },
            bottomSpacer: {
                height: 20,
            },
        });
    }, [theme]);
}