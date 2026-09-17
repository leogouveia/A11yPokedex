---
name: react-native-accessibility
description: >
  Guidelines for designing, implementing, reviewing, and testing
  accessible React Native interfaces for Android and iOS.
  Use this skill whenever work involves UI components, navigation,
  forms, images, dynamic content, loading/error states, or
  accessibility review in a React Native application.
---

# React Native Accessibility

Use this skill when designing, implementing, reviewing, or testing
user interfaces in React Native.

Accessibility is a product requirement, not a final review step.

## 1. Semantic meaning

Interactive elements must expose their purpose to assistive technologies.

- Use appropriate semantic roles.
- Prefer native semantic behavior when available.
- Do not rely on visual appearance to communicate purpose.
- Do not include the control type redundantly in its accessible label.
- Decorative elements must not create unnecessary screen-reader stops.

When using React Native, evaluate whether properties such as these are needed:

- `accessible`
- `accessibilityLabel`
- `accessibilityHint`
- `accessibilityRole` / `role`
- `accessibilityState`
- `accessibilityValue`

Do not add accessibility properties mechanically when React Native
already exposes the correct semantics.

## 2. Screen readers

All primary flows must be usable with:

- TalkBack on Android
- VoiceOver on iOS

Check:

- meaningful labels;
- correct roles;
- correct states;
- logical reading order;
- absence of duplicated announcements;
- absence of inaccessible interactive elements;
- meaningful announcements for important dynamic changes.

Do not assume Android and iOS expose identical accessibility behavior.

## 3. Images

Determine whether an image is informative or decorative.

Informative images require an accessible alternative that communicates
their purpose or relevant information.

Decorative images should not introduce unnecessary screen-reader stops.

Do not describe purely visual details unless they are meaningful to
the user's task.

## 4. Touch targets

Interactive controls should provide an adequate touch target.

For Android, target at least 48dp by 48dp unless a documented platform
or component behavior provides an equivalent accessible interaction.

The visible element does not necessarily need to occupy the entire
touch target.

## 5. Color and contrast

Never use color as the only way to communicate information.

Text, icons, controls, focus indicators, and meaningful graphical
elements must maintain sufficient contrast against their backgrounds.

When the product specification requires WCAG AA, verify applicable
contrast requirements rather than estimating contrast visually.

## 6. Dynamic text

Respect the user's system font-size preferences.

Do not disable font scaling merely to preserve layout.

Interfaces must remain understandable and operable when text grows.

Check for:

- clipped text;
- overlapping content;
- truncated labels;
- fixed-height containers that cannot accommodate larger text;
- controls whose labels become unusable.

## 7. Dynamic content and feedback

Loading, error, empty, success, and other important state changes must
be perceivable without relying only on visual changes.

When necessary, use the appropriate React Native accessibility APIs
to announce dynamic changes.

Avoid excessive announcements that interrupt the user unnecessarily.

## 8. Lists and repeated content

Repeated elements must remain distinguishable to assistive technology.

For interactive list items:

- expose meaningful content;
- expose the correct interaction semantics;
- avoid repeated ambiguous labels such as "Open" or "Details";
- ensure the user can understand which item will be activated.

## 9. Accessibility review

When reviewing code, report accessibility findings separately.

For each finding provide:

1. severity;
2. affected component or screen;
3. violated accessibility principle;
4. user impact;
5. recommended correction.

Do not mark accessibility as passing based only on static code inspection
when the requirement needs runtime verification.

## 10. Accessibility testing

Accessibility validation must include manual testing where applicable.

At minimum consider:

- TalkBack on Android;
- VoiceOver on iOS;
- increased system font size;
- touch target size;
- color contrast;
- reading/focus order;
- loading, empty and error states.

Automated tests may complement but do not replace assistive-technology
testing.

## Definition of Done

A UI feature is not accessibility-complete until:

- semantics are appropriate;
- primary actions are operable with screen readers;
- important information is not conveyed only visually;
- dynamic text does not break the primary flow;
- touch targets are adequate;
- relevant state changes are perceivable;
- applicable acceptance criteria from the product specification have
  been verified.
