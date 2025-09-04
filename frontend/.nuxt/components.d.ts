
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


export const ExportData: typeof import("../components/ExportData.vue")['default']
export const ImageUpload: typeof import("../components/ImageUpload.vue")['default']
export const NotificationCenter: typeof import("../components/NotificationCenter.vue")['default']
export const RiskAnalytics: typeof import("../components/RiskAnalytics.vue")['default']
export const TradeJournal: typeof import("../components/TradeJournal.vue")['default']
export const ChartsEquityCurve: typeof import("../components/charts/EquityCurve.vue")['default']
export const ChartsSymbolPerformance: typeof import("../components/charts/SymbolPerformance.vue")['default']
export const ChartsWinLossRatio: typeof import("../components/charts/WinLossRatio.vue")['default']
export const UAccordion: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Accordion.vue")['default']
export const UAlert: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Alert.vue")['default']
export const UAvatar: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Avatar.vue")['default']
export const UAvatarGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/AvatarGroup")['default']
export const UBadge: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Badge.vue")['default']
export const UButton: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Button.vue")['default']
export const UButtonGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/ButtonGroup")['default']
export const UCarousel: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Carousel.vue")['default']
export const UChip: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Chip.vue")['default']
export const UDropdown: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Dropdown.vue")['default']
export const UIcon: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Icon.vue")['default']
export const UKbd: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Kbd.vue")['default']
export const ULink: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Link.vue")['default']
export const UMeter: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Meter.vue")['default']
export const UMeterGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/MeterGroup")['default']
export const UProgress: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Progress.vue")['default']
export const UCheckbox: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Checkbox.vue")['default']
export const UForm: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Form.vue")['default']
export const UFormGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/FormGroup.vue")['default']
export const UInput: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Input.vue")['default']
export const UInputMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/InputMenu.vue")['default']
export const URadio: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Radio.vue")['default']
export const URadioGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/RadioGroup.vue")['default']
export const URange: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Range.vue")['default']
export const USelect: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Select.vue")['default']
export const USelectMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/SelectMenu.vue")['default']
export const UTextarea: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Textarea.vue")['default']
export const UToggle: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Toggle.vue")['default']
export const UTable: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/data/Table.vue")['default']
export const UCard: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Card.vue")['default']
export const UContainer: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Container.vue")['default']
export const UDivider: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Divider.vue")['default']
export const USkeleton: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Skeleton.vue")['default']
export const UBreadcrumb: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Breadcrumb.vue")['default']
export const UCommandPalette: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPalette.vue")['default']
export const UCommandPaletteGroup: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPaletteGroup.vue")['default']
export const UHorizontalNavigation: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/HorizontalNavigation.vue")['default']
export const UPagination: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Pagination.vue")['default']
export const UTabs: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Tabs.vue")['default']
export const UVerticalNavigation: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/VerticalNavigation.vue")['default']
export const UContextMenu: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/ContextMenu.vue")['default']
export const UModal: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modal.vue")['default']
export const UModals: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modals.client.vue")['default']
export const UNotification: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notification.vue")['default']
export const UNotifications: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notifications.vue")['default']
export const UPopover: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Popover.vue")['default']
export const USlideover: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideover.vue")['default']
export const USlideovers: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideovers.client.vue")['default']
export const UTooltip: typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Tooltip.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const Icon: typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']
export const ColorScheme: typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const UModals: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const USlideovers: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const LazyExportData: LazyComponent<typeof import("../components/ExportData.vue")['default']>
export const LazyImageUpload: LazyComponent<typeof import("../components/ImageUpload.vue")['default']>
export const LazyNotificationCenter: LazyComponent<typeof import("../components/NotificationCenter.vue")['default']>
export const LazyRiskAnalytics: LazyComponent<typeof import("../components/RiskAnalytics.vue")['default']>
export const LazyTradeJournal: LazyComponent<typeof import("../components/TradeJournal.vue")['default']>
export const LazyChartsEquityCurve: LazyComponent<typeof import("../components/charts/EquityCurve.vue")['default']>
export const LazyChartsSymbolPerformance: LazyComponent<typeof import("../components/charts/SymbolPerformance.vue")['default']>
export const LazyChartsWinLossRatio: LazyComponent<typeof import("../components/charts/WinLossRatio.vue")['default']>
export const LazyUAccordion: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Accordion.vue")['default']>
export const LazyUAlert: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Alert.vue")['default']>
export const LazyUAvatar: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Avatar.vue")['default']>
export const LazyUAvatarGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/AvatarGroup")['default']>
export const LazyUBadge: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Badge.vue")['default']>
export const LazyUButton: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Button.vue")['default']>
export const LazyUButtonGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/ButtonGroup")['default']>
export const LazyUCarousel: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Carousel.vue")['default']>
export const LazyUChip: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Chip.vue")['default']>
export const LazyUDropdown: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Dropdown.vue")['default']>
export const LazyUIcon: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Icon.vue")['default']>
export const LazyUKbd: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Kbd.vue")['default']>
export const LazyULink: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Link.vue")['default']>
export const LazyUMeter: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Meter.vue")['default']>
export const LazyUMeterGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/MeterGroup")['default']>
export const LazyUProgress: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/elements/Progress.vue")['default']>
export const LazyUCheckbox: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Checkbox.vue")['default']>
export const LazyUForm: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Form.vue")['default']>
export const LazyUFormGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/FormGroup.vue")['default']>
export const LazyUInput: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Input.vue")['default']>
export const LazyUInputMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/InputMenu.vue")['default']>
export const LazyURadio: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Radio.vue")['default']>
export const LazyURadioGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/RadioGroup.vue")['default']>
export const LazyURange: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Range.vue")['default']>
export const LazyUSelect: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Select.vue")['default']>
export const LazyUSelectMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/SelectMenu.vue")['default']>
export const LazyUTextarea: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Textarea.vue")['default']>
export const LazyUToggle: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/forms/Toggle.vue")['default']>
export const LazyUTable: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/data/Table.vue")['default']>
export const LazyUCard: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Card.vue")['default']>
export const LazyUContainer: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Container.vue")['default']>
export const LazyUDivider: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Divider.vue")['default']>
export const LazyUSkeleton: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/layout/Skeleton.vue")['default']>
export const LazyUBreadcrumb: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Breadcrumb.vue")['default']>
export const LazyUCommandPalette: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPalette.vue")['default']>
export const LazyUCommandPaletteGroup: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/CommandPaletteGroup.vue")['default']>
export const LazyUHorizontalNavigation: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/HorizontalNavigation.vue")['default']>
export const LazyUPagination: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Pagination.vue")['default']>
export const LazyUTabs: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/Tabs.vue")['default']>
export const LazyUVerticalNavigation: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/navigation/VerticalNavigation.vue")['default']>
export const LazyUContextMenu: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/ContextMenu.vue")['default']>
export const LazyUModal: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modal.vue")['default']>
export const LazyUModals: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Modals.client.vue")['default']>
export const LazyUNotification: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notification.vue")['default']>
export const LazyUNotifications: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Notifications.vue")['default']>
export const LazyUPopover: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Popover.vue")['default']>
export const LazyUSlideover: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideover.vue")['default']>
export const LazyUSlideovers: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Slideovers.client.vue")['default']>
export const LazyUTooltip: LazyComponent<typeof import("../node_modules/@nuxt/ui/dist/runtime/components/overlays/Tooltip.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyIcon: LazyComponent<typeof import("../node_modules/@nuxt/icon/dist/runtime/components/index")['default']>
export const LazyColorScheme: LazyComponent<typeof import("../node_modules/@nuxtjs/color-mode/dist/runtime/component.vue3.vue")['default']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyUModals: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyUSlideovers: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>

export const componentNames: string[]
