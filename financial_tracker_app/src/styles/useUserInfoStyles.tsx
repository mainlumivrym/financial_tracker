import { useMemo } from "react";
import { useTheme } from '../context/ThemeContext';
import { StyleSheet } from 'react-native';

export default function useUserInfoStyles() {
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
                color: theme.colors.text,
                padding: 8,
            },
            headerTitle: {
                fontSize: 20,
                fontWeight: 'bold',
                color: theme.colors.text,
            },
            editButton: {
                padding: 8,
            },
            editButtonText: {
                fontSize: 16,
                color: theme.colors.primary,
                fontWeight: '600',
            },
            scrollView: {
                flex: 1,
                paddingHorizontal: 20,
            },
            avatarSection: {
                alignItems: 'center',
                marginBottom: 30,
            },
            avatarContainer: {
                width: 120,
                height: 120,
                borderRadius: 60,
                backgroundColor: theme.colors.backgroundLight,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 3,
                borderColor: theme.colors.primary,
                overflow: 'hidden',
            },
            profileImage: {
                width: '100%',
                height: '100%',
                borderRadius: 60,
            },
            changePhotoButton: {
                marginTop: 12,
            },
            changePhotoText: {
                color: theme.colors.primary,
                fontSize: 16,
                fontWeight: '600',
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
            infoCard: {
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 16,
                padding: 20,
            },
            infoItem: {
                paddingVertical: 8,
            },
            label: {
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginBottom: 8,
            },
            value: {
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: '500',
            },
            input: {
                fontSize: 16,
                color: theme.colors.text,
                fontWeight: '500',
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                padding: 12,
                borderWidth: 1,
                borderColor: theme.colors.divider,
            },
            helperText: {
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginTop: 4,
                fontStyle: 'italic',
            },
            divider: {
                height: 1,
                backgroundColor: theme.colors.backgroundLight,
                marginVertical: 16,
            },
            settingItem: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
            },
            settingLeft: {
                flexDirection: 'row',
                alignItems: 'center',
            },
            settingText: {
                fontSize: 16,
                color: theme.colors.text,
                marginLeft: 16,
            },
            logoutButton: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.colors.backgroundLight,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: theme.colors.danger,
            },
            logoutText: {
                fontSize: 16,
                color: theme.colors.danger,
                fontWeight: '600',
                marginLeft: 12,
            },
            bottomSpacer: {
                height: 40,
            },
        });
    }, [theme]);
}