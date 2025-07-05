import { useWindowDimensions } from 'react-native';

const baseHeadingStyle = {
  fontFamily: 'berlin-sans-fb-bold',
  letterSpacing: 1,
  width: '100%',
  fontSize: 16,
  marginBottom: 20,
  textAlign: 'left',
};

export const useResponsiveHeadingStyle = () => {
  const { width } = useWindowDimensions();
  return [
    baseHeadingStyle,
    { maxWidth: width < 450 ? 400 : 600 },
    { paddingLeft: width < 450 ? 20 : 0 },
  ];
};

// New hook for button text visibility
export const useResponsiveButtonText = () => {
  const { width } = useWindowDimensions();

  return {
    showButtonText: width >= 400, // Hide text on screens smaller than 400px
    isSmallScreen: width < 450,
    isTinyScreen: width < 350,
  };
};

// Button style adjustments for responsive design
export const useResponsiveButtonStyle = () => {
  const { width } = useWindowDimensions();
  const showButtonText = width >= 400;

  const baseButtonStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: showButtonText ? 'space-between' : 'center',
    paddingVertical: 2,
    paddingHorizontal: showButtonText ? 12 : 8,
    minWidth: width < 400 ? 50 : 120, // Increased minWidth when showing text
    width: '100%', // Ensure button takes full container width
  };

  return {
    buttonStyle: baseButtonStyle,
    containerStyle: {
      width: width < 400 ? '30%' : '33%',
      maxWidth: width < 400 ? 80 : 200,
    },
  };
};
