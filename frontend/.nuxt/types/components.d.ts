
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>

type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)

interface _GlobalComponents {
      'ExportData': typeof import("../components/ExportData.vue")['default']
    'ImageUpload': typeof import("../components/ImageUpload.vue")['default']
    'NotificationCenter': typeof import("../components/NotificationCenter.vue")['default']
    'RiskAnalytics': typeof import("../components/RiskAnalytics.vue")['default']
    'TradeJournal': typeof import("../components/TradeJournal.vue")['default']
    'ChartsEquityCurve': typeof import("../components/charts/EquityCurve.vue")['default']
    'ChartsSymbolPerformance': typeof import("../components/charts/SymbolPerformance.vue")['default']
    'ChartsWinLossRatio': typeof import("../components/charts/WinLossRatio.vue")['default']
    'UAccordion': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Accordion.vue")['default']
    'UAlert': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Alert.vue")['default']
    'UAvatar': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Avatar.vue")['default']
    'UAvatarGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/AvatarGroup")['default']
    'UBadge': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Badge.vue")['default']
    'UButton': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Button.vue")['default']
    'UButtonGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/ButtonGroup")['default']
    'UCarousel': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Carousel.vue")['default']
    'UChip': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Chip.vue")['default']
    'UDropdown': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Dropdown.vue")['default']
    'UIcon': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Icon.vue")['default']
    'UKbd': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Kbd.vue")['default']
    'ULink': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Link.vue")['default']
    'UMeter': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Meter.vue")['default']
    'UMeterGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/MeterGroup")['default']
    'UProgress': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Progress.vue")['default']
    'UCheckbox': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Checkbox.vue")['default']
    'UForm': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Form.vue")['default']
    'UFormGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/FormGroup.vue")['default']
    'UInput': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Input.vue")['default']
    'UInputMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/InputMenu.vue")['default']
    'URadio': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Radio.vue")['default']
    'URadioGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/RadioGroup.vue")['default']
    'URange': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Range.vue")['default']
    'USelect': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Select.vue")['default']
    'USelectMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/SelectMenu.vue")['default']
    'UTextarea': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Textarea.vue")['default']
    'UToggle': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Toggle.vue")['default']
    'UTable': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/data/Table.vue")['default']
    'UCard': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Card.vue")['default']
    'UContainer': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Container.vue")['default']
    'UDivider': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Divider.vue")['default']
    'USkeleton': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Skeleton.vue")['default']
    'UBreadcrumb': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Breadcrumb.vue")['default']
    'UCommandPalette': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPalette.vue")['default']
    'UCommandPaletteGroup': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPaletteGroup.vue")['default']
    'UHorizontalNavigation': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/HorizontalNavigation.vue")['default']
    'UPagination': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Pagination.vue")['default']
    'UTabs': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Tabs.vue")['default']
    'UVerticalNavigation': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/VerticalNavigation.vue")['default']
    'UContextMenu': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/ContextMenu.vue")['default']
    'UModal': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modal.vue")['default']
    'UModals': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modals.client.vue")['default']
    'UNotification': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notification.vue")['default']
    'UNotifications': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notifications.vue")['default']
    'UPopover': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Popover.vue")['default']
    'USlideover': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideover.vue")['default']
    'USlideovers': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideovers.client.vue")['default']
    'UTooltip': typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Tooltip.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'Icon': typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
    'ColorScheme': typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'UModals': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'USlideovers': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
      'LazyExportData': LazyComponent<typeof import("../components/ExportData.vue")['default']>
    'LazyImageUpload': LazyComponent<typeof import("../components/ImageUpload.vue")['default']>
    'LazyNotificationCenter': LazyComponent<typeof import("../components/NotificationCenter.vue")['default']>
    'LazyRiskAnalytics': LazyComponent<typeof import("../components/RiskAnalytics.vue")['default']>
    'LazyTradeJournal': LazyComponent<typeof import("../components/TradeJournal.vue")['default']>
    'LazyChartsEquityCurve': LazyComponent<typeof import("../components/charts/EquityCurve.vue")['default']>
    'LazyChartsSymbolPerformance': LazyComponent<typeof import("../components/charts/SymbolPerformance.vue")['default']>
    'LazyChartsWinLossRatio': LazyComponent<typeof import("../components/charts/WinLossRatio.vue")['default']>
    'LazyUAccordion': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Accordion.vue")['default']>
    'LazyUAlert': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Alert.vue")['default']>
    'LazyUAvatar': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Avatar.vue")['default']>
    'LazyUAvatarGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/AvatarGroup")['default']>
    'LazyUBadge': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Badge.vue")['default']>
    'LazyUButton': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Button.vue")['default']>
    'LazyUButtonGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/ButtonGroup")['default']>
    'LazyUCarousel': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Carousel.vue")['default']>
    'LazyUChip': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Chip.vue")['default']>
    'LazyUDropdown': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Dropdown.vue")['default']>
    'LazyUIcon': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Icon.vue")['default']>
    'LazyUKbd': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Kbd.vue")['default']>
    'LazyULink': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Link.vue")['default']>
    'LazyUMeter': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Meter.vue")['default']>
    'LazyUMeterGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/MeterGroup")['default']>
    'LazyUProgress': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Progress.vue")['default']>
    'LazyUCheckbox': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Checkbox.vue")['default']>
    'LazyUForm': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Form.vue")['default']>
    'LazyUFormGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/FormGroup.vue")['default']>
    'LazyUInput': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Input.vue")['default']>
    'LazyUInputMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/InputMenu.vue")['default']>
    'LazyURadio': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Radio.vue")['default']>
    'LazyURadioGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/RadioGroup.vue")['default']>
    'LazyURange': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Range.vue")['default']>
    'LazyUSelect': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Select.vue")['default']>
    'LazyUSelectMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/SelectMenu.vue")['default']>
    'LazyUTextarea': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Textarea.vue")['default']>
    'LazyUToggle': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Toggle.vue")['default']>
    'LazyUTable': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/data/Table.vue")['default']>
    'LazyUCard': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Card.vue")['default']>
    'LazyUContainer': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Container.vue")['default']>
    'LazyUDivider': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Divider.vue")['default']>
    'LazyUSkeleton': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Skeleton.vue")['default']>
    'LazyUBreadcrumb': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Breadcrumb.vue")['default']>
    'LazyUCommandPalette': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPalette.vue")['default']>
    'LazyUCommandPaletteGroup': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPaletteGroup.vue")['default']>
    'LazyUHorizontalNavigation': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/HorizontalNavigation.vue")['default']>
    'LazyUPagination': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Pagination.vue")['default']>
    'LazyUTabs': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Tabs.vue")['default']>
    'LazyUVerticalNavigation': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/VerticalNavigation.vue")['default']>
    'LazyUContextMenu': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/ContextMenu.vue")['default']>
    'LazyUModal': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modal.vue")['default']>
    'LazyUModals': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modals.client.vue")['default']>
    'LazyUNotification': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notification.vue")['default']>
    'LazyUNotifications': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notifications.vue")['default']>
    'LazyUPopover': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Popover.vue")['default']>
    'LazyUSlideover': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideover.vue")['default']>
    'LazyUSlideovers': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideovers.client.vue")['default']>
    'LazyUTooltip': LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Tooltip.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyIcon': LazyComponent<typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
    'LazyColorScheme': LazyComponent<typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyUModals': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyUSlideovers': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export {}
