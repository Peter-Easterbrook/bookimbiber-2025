import { useWindowDimensions } from 'react-native';

const baseHeadingStyle = {
  fontFamily: 'berlin-sans-fb-bold',
  letterSpacing: 1,
  width: '100%',
  fontSize: 16,
  marginBottom: 10,
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

  const baseButtonStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 0,
    paddingHorizontal: width < 400 ? 4 : 8,
    minWidth: width < 400 ? 50 : 100,
  };

  return {
    buttonStyle: baseButtonStyle,
    containerStyle: {
      width: width < 400 ? '30%' : '33%',
      maxWidth: width < 400 ? 80 : 200,
    },
  };
};
