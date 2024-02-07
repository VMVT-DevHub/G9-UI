import { isEmpty } from 'lodash';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Button, { ButtonColors } from '../Components/buttons/Button';
import ExceededContainer from '../Components/containers/ExceededContainer';
import LackContainer from '../Components/containers/LackContainer';
import RepeatContainer from '../Components/containers/RepeatContainer';
import { PageContainer, Title } from '../Components/other/CommonStyles';
import FullscreenLoader from '../Components/other/FullscreenLoader';
import Icon, { IconName } from '../Components/other/Icons';
import InfoRow from '../Components/other/InfoRow';
import { device, theme } from '../styles';
import { IndicatorOptionWithDiscrepancies } from '../types';
import { getIndicatorLabel, getYearRange, handleIsApproved } from '../utils/functions';
import { useDeclaration, useMappedIndicatorsWithDiscrepancies } from '../utils/hooks';
import { slugs } from '../utils/routes';

export enum IndicatorStatus {
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  NOT_CHECKED = 'NOT_CHECKED',
}

const indicatorColors = {
  [IndicatorStatus.APPROVED]: theme.colors.success,
  [IndicatorStatus.ACTIVE]: theme.colors.text.active,
  [IndicatorStatus.NOT_CHECKED]: theme.colors.grey,
};

const Discrepancies = () => {
  const { businessPlaceId = '', id = '' } = useParams();

  const { canDeclare, declarationLoading, mappedDeclaration } = useDeclaration();

  const yearRange = getYearRange(mappedDeclaration?.year);

  useEffect(() => {
    if (declarationLoading) return;

    if (!canDeclare) {
      navigate(slugs.declaration(businessPlaceId, id));
    }
  }, [declarationLoading]);

  const navigate = useNavigate();
  const [activeIndicator, setActiveIndicator] = useState<
    IndicatorOptionWithDiscrepancies | undefined
  >(undefined);

  const { mappedIndicators, isLoading, discrepancies, isAllApproved } =
    useMappedIndicatorsWithDiscrepancies();

  useEffect(() => {
    if (!activeIndicator?.id) {
      if (!isEmpty(mappedIndicators)) {
        setActiveIndicator(mappedIndicators[0]);
      }

      return;
    }

    setActiveIndicator(() => mappedIndicators.find((item) => item.id == activeIndicator?.id));
  }, [mappedIndicators]);

  const hasNext =
    typeof activeIndicator?.index === 'number' && !!mappedIndicators[activeIndicator?.index + 1];

  if (isLoading || declarationLoading) return <FullscreenLoader />;

  return (
    <PageContainer>
      <TopRow>
        <div>
          <Title>{'Neatitikčių peržiūra ir patvirtinimas'}</Title>

          <InfoRow info={['Prašome pateikite pastabas prie rodiklių kurie viršija ribas.']} />
        </div>
        <ButtonRow>
          <Button
            onClick={() => navigate(slugs.declaration(businessPlaceId, id))}
            variant={ButtonColors.BACK}
            type="button"
          >
            {'Grįžti atgal'}
          </Button>
          {isAllApproved && (
            <Button
              onClick={() => navigate(slugs.submitDeclaration(businessPlaceId, id))}
              type="button"
            >
              {'Deklaruoti'}
            </Button>
          )}
        </ButtonRow>
      </TopRow>
      <Content>
        <Column>
          {mappedIndicators.map((indicator, index) => {
            const handleGetStatus = (indicator) => {
              if (indicator.id === activeIndicator?.id) {
                return IndicatorStatus.ACTIVE;
              }

              const isApproved = handleIsApproved(indicator);

              if (isApproved) {
                return IndicatorStatus.APPROVED;
              }

              return IndicatorStatus.NOT_CHECKED;
            };

            const status = handleGetStatus(indicator);

            const isApproved = status === IndicatorStatus.APPROVED;

            return (
              <IndicatorLine
                key={`indicator-${indicator}-${index}`}
                onClick={() => setActiveIndicator(indicator)}
              >
                <Circle $status={status}>
                  {isApproved && <Verified name={IconName.checkMark} />}
                </Circle>
                <IndicatorText $status={status}>{getIndicatorLabel(indicator)}</IndicatorText>
              </IndicatorLine>
            );
          })}
        </Column>

        <ContainersColumn>
          <IndicatorTitle>{getIndicatorLabel(activeIndicator)}</IndicatorTitle>
          {activeIndicator?.data?.repeats && (
            <RepeatContainer unit={activeIndicator.unit} repeats={activeIndicator?.data?.repeats} />
          )}

          {activeIndicator?.data?.lack && <LackContainer lack={activeIndicator?.data?.lack} />}

          {activeIndicator?.data?.exceeded && (
            <ExceededContainer
              groupId={activeIndicator.groupId}
              yearRange={yearRange}
              options={discrepancies?.Virsijimas?.Lookup}
              unit={activeIndicator.unit}
              exceeded={activeIndicator?.data?.exceeded}
              description={activeIndicator.description}
            />
          )}
          {hasNext ? (
            <Row onClick={() => setActiveIndicator(mappedIndicators[activeIndicator.index + 1])}>
              <BackButton> {'Kitas rodiklis'}</BackButton>
              <Icon name={IconName.arrowNext} />
            </Row>
          ) : (
            ''
          )}
        </ContainersColumn>
      </Content>
    </PageContainer>
  );
};

const BackButton = styled.div`
  font-size: 1.4rem;
  color: #121926;
  margin-left: 11px;
`;

const Row = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
`;

const IndicatorText = styled.div<{ $status: IndicatorStatus }>`
  font-size: 1.4rem;
  color: ${({ $status }) => indicatorColors[$status]};
  cursor: pointer;
  width: 250px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const IndicatorLine = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
`;

const Verified = styled(Icon)`
  color: white;
`;

const Content = styled.div`
  margin-top: 86px;
  display: flex;
  gap: 50px;
  @media ${device.mobileL} {
    flex-direction: column;
  }
`;

const Circle = styled.div<{ $status: IndicatorStatus }>`
  width: 24px;
  height: 24px;
  border-radius: 50px;
  background-color: ${({ $status }) => indicatorColors[$status]};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const IndicatorTitle = styled.div`
  font-weight: bold;
  font-size: 2rem;
`;

const ContainersColumn = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
  min-width: 0;
`;

export default Discrepancies;
